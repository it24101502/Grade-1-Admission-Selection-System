// ================================================================
//  FILE: src/main/java/lk/school/admission/service/JudgeService.java
//
//  STEP 5 & 6: Judge views assigned applications, enters marks,
//              flags applications for attention.
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.Application;
import lk.school.admission.entity.ApplicationCategory;
import lk.school.admission.entity.Judge;
import lk.school.admission.repository.apps.ApplicationRepository;
import lk.school.admission.repository.system.JudgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class JudgeService {

    @Autowired private ApplicationRepository appRepo;
    @Autowired private JudgeRepository       judgeRepo;

    // ── Get all applications assigned to this judge ───────────

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public List<Map<String, Object>> getAssignedApplications(String judgeUsername) {
        Judge judge = findJudge(judgeUsername);
        return appRepo.findByCategoryAndAssignedJudgeId(
                judge.getCategory().name(), judge.getId())
            .stream().map(this::toMap).collect(Collectors.toList());
    }

    // ── Get single application detail ─────────────────────────

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public Map<String, Object> getApplicationDetail(Long appId, String judgeUsername) {
        Judge judge = findJudge(judgeUsername);
        Application app = findApp(appId);
        checkAccess(app, judge);
        return toDetailMap(app);
    }

    // ── Enter total score and comment ─────────────────────────

    @Transactional("appsTransactionManager")
    public Map<String, Object> enterScore(Long appId, Double score,
                                           String comment, String judgeUsername) {
        Judge judge = findJudge(judgeUsername);
        Application app = findApp(appId);
        checkAccess(app, judge);

        app.setTotalScore(score);
        app.setJudgeComment(comment);
        app.setStatus("SCORED");
        appRepo.save(app);

        recalculateRankings(app.getCategory());

        Map<String, Object> result = new HashMap<>();
        result.put("message",           "Score saved");
        result.put("applicationNumber", app.getApplicationNumber());
        result.put("totalScore",        score);
        result.put("status",            app.getStatus());
        return result;
    }

    // ── Set / clear flag ──────────────────────────────────────

    @Transactional("appsTransactionManager")
    public Map<String, Object> setFlag(Long appId, String flagColor,
                                        String reason, String judgeUsername) {
        Judge judge = findJudge(judgeUsername);
        Application app = findApp(appId);
        checkAccess(app, judge);

        if (flagColor == null || flagColor.isBlank()) {
            // Clear flag
            app.setFlagColor(null);
            app.setFlagReason(null);
            app.setStatus(app.getTotalScore() != null ? "SCORED" : "UNDER_REVIEW");
        } else {
            String color = flagColor.trim().toUpperCase();
            if (!List.of("GREEN", "YELLOW", "RED").contains(color))
                throw new RuntimeException("flagColor must be GREEN, YELLOW, or RED");
            app.setFlagColor(color);
            app.setFlagReason(reason);
            app.setStatus("FLAGGED");
        }
        appRepo.save(app);

        Map<String, Object> result = new HashMap<>();
        result.put("message",   app.isFlagged() ? "Flag set to " + app.getFlagColor() : "Flag cleared");
        result.put("flagColor", app.getFlagColor());
        return result;
    }

    // ── Ranked list ───────────────────────────────────────────

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public List<Map<String, Object>> getRankedList(String judgeUsername, String sortField, String sortDir) {
        Judge judge = findJudge(judgeUsername);
        List<Application> apps = appRepo.findRankedByCategory(judge.getCategory().name());

        // Apply optional custom sort
        Comparator<Application> comparator = buildComparator(sortField, sortDir);
        if (comparator != null) apps = apps.stream().sorted(comparator).collect(Collectors.toList());

        // Assign rank numbers after sort
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < apps.size(); i++) {
            Map<String, Object> m = toMap(apps.get(i));
            m.put("rank", i + 1);
            result.add(m);
        }
        return result;
    }

    // ── Stats for judge dashboard ─────────────────────────────

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public Map<String, Object> getStats(String judgeUsername) {
        Judge judge = findJudge(judgeUsername);
        List<Application> all = appRepo.findByCategoryAndAssignedJudgeId(
            judge.getCategory().name(), judge.getId());

        long total   = all.size();
        long scored  = all.stream().filter(a -> a.getTotalScore() != null).count();
        long pending = all.stream().filter(a -> a.getTotalScore() == null && !a.isFlagged()).count();
        long flagged = all.stream().filter(Application::isFlagged).count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("category",      judge.getCategory().name());
        stats.put("judgeName",     judge.getFullName());
        stats.put("total",         total);
        stats.put("scored",        scored);
        stats.put("pending",       pending);
        stats.put("flagged",       flagged);
        stats.put("completionPct", total > 0 ? Math.round((scored * 100.0) / total) : 0);
        return stats;
    }

    // ── Private helpers ───────────────────────────────────────

    private Judge findJudge(String username) {
        return judgeRepo.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Judge not found: " + username));
    }

    private Application findApp(Long id) {
        return appRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Application not found: " + id));
    }

    private void checkAccess(Application app, Judge judge) {
        if (!judge.getId().equals(app.getAssignedJudgeId()))
            throw new RuntimeException("Access denied: application not assigned to you");
    }

    private void recalculateRankings(String category) {
        List<Application> ranked = appRepo.findRankedByCategory(category);
        for (int i = 0; i < ranked.size(); i++) {
            ranked.get(i).setRankInCategory(i + 1);
        }
        appRepo.saveAll(ranked);
    }

    private Comparator<Application> buildComparator(String field, String dir) {
        if (field == null) return null;
        boolean asc = !"desc".equalsIgnoreCase(dir);
        Comparator<Application> c = switch (field.toLowerCase()) {
            case "totalscore", "total_score" ->
                Comparator.comparingDouble(a -> a.getTotalScore() != null ? a.getTotalScore() : -1.0);
            case "distance", "distancefromschoolkm" ->
                Comparator.comparingDouble(a -> a.getDistanceFromSchoolKm() != null ? a.getDistanceFromSchoolKm() : 99999.0);
            case "childnameenglish", "name" ->
                Comparator.comparing(a -> a.getChildNameEnglish() != null ? a.getChildNameEnglish() : "");
            case "dateofbirth", "dob" ->
                Comparator.comparing(a -> a.getDateOfBirth() != null ? a.getDateOfBirth().toString() : "");
            default -> null;
        };
        if (c == null) return null;
        return asc ? c : c.reversed();
    }

    // ── toMap ─────────────────────────────────────────────────

    private Map<String, Object> toMap(Application a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",                   a.getId());
        m.put("applicationNumber",    a.getApplicationNumber());
        m.put("childNameEnglish",     a.getChildNameEnglish());
        m.put("childNameSinhala",     a.getChildNameSinhala());
        m.put("dateOfBirth",          a.getDateOfBirth() != null ? a.getDateOfBirth().toString() : null);
        m.put("applicantNameEnglish", a.getApplicantNameEnglish());
        m.put("applicantRelationship",a.getApplicantRelationship());
        m.put("contactNumber",        a.getContactNumber());
        m.put("district",             a.getDistrict());
        m.put("distanceFromSchoolKm", a.getDistanceFromSchoolKm());
        m.put("category",             a.getCategory());
        m.put("status",               a.getStatus());
        m.put("totalScore",           a.getTotalScore());
        m.put("rankInCategory",       a.getRankInCategory());
        m.put("flagColor",            a.getFlagColor());
        m.put("flagReason",           a.getFlagReason());
        m.put("judgeComment",         a.getJudgeComment());
        m.put("submittedAt",          a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : null);
        return m;
    }

    private Map<String, Object> toDetailMap(Application a) {
        Map<String, Object> m = toMap(a);
        m.put("applicantNameSinhala", a.getApplicantNameSinhala());
        m.put("applicantNic",         a.getApplicantNic());
        m.put("phoneNumber",          a.getPhoneNumber());
        m.put("addressLine1",         a.getAddressLine1());
        m.put("addressLine2",         a.getAddressLine2());
        m.put("town",                 a.getTown());
        m.put("street",               a.getStreet());
        m.put("locationLink",         a.getLocationLink());
        m.put("birthCertNumber",      a.getBirthCertNumber());
        m.put("birthCertDivision",    a.getBirthCertDivision());
        m.put("birthCertDistrict",    a.getBirthCertDistrict());
        m.put("motherFullName",       a.getMotherFullName());
        m.put("motherContact",        a.getMotherContact());
        m.put("motherOccupation",     a.getMotherOccupation());
        m.put("motherWorkplace",      a.getMotherWorkplace());
        m.put("fatherFullName",       a.getFatherFullName());
        m.put("fatherContact",        a.getFatherContact());
        m.put("fatherOccupation",     a.getFatherOccupation());
        m.put("fatherWorkplace",      a.getFatherWorkplace());
        return m;
    }
}