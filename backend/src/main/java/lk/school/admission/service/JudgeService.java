// ================================================================
//  FILE: src/main/java/lk/school/admission/service/JudgeService.java
//
//  STEP 5 & 6: Judge views assigned applications, enters marks,
//              flags applications for attention.
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.*;
import lk.school.admission.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class JudgeService {

    @Autowired private ApplicationRepository applicationRepo;
    @Autowired private JudgeRepository       judgeRepo;

    // ── Get all applications assigned to this judge ───────────
    public List<Map<String, Object>> getAssignedApplications(String judgeUsername) {
        Judge judge = judgeRepo.findByUsername(judgeUsername)
                .orElseThrow(() -> new RuntimeException("Judge not found"));

        return applicationRepo
                .findByCategoryAndAssignedJudgeId(judge.getCategory(), judge.getId())
                .stream()
                .map(this::toMap)
                .toList();
    }

    // ── Get single application detail ─────────────────────────
    public Map<String, Object> getApplicationDetail(Long applicationId, String judgeUsername) {
        Judge judge = judgeRepo.findByUsername(judgeUsername)
                .orElseThrow(() -> new RuntimeException("Judge not found"));

        Application app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Ensure judge can only access their own category
        if (app.getAssignedJudge() == null ||
            !app.getAssignedJudge().getId().equals(judge.getId())) {
            throw new RuntimeException("Access denied: this application is not assigned to you");
        }

        return toDetailMap(app);
    }

    // ── STEP 5: Enter marks for an application ────────────────
    @Transactional
    public Map<String, Object> enterMarks(Long applicationId,
                                          Double marks,
                                          String visitComment,
                                          String judgeUsername) {
        Judge judge = judgeRepo.findByUsername(judgeUsername)
                .orElseThrow(() -> new RuntimeException("Judge not found"));

        Application app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (app.getAssignedJudge() == null ||
            !app.getAssignedJudge().getId().equals(judge.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (marks < 0 || marks > 100) {
            throw new RuntimeException("Marks must be between 0 and 100");
        }

        app.setTotalMarks(marks);
        app.setVisitComment(visitComment);
        app.setStatus(ApplicationStatus.SCORED);
        applicationRepo.save(app);

        // Recalculate rankings for this category
        recalculateRankings(app.getCategory());

        Map<String, Object> result = new HashMap<>();
        result.put("message",           "Marks saved successfully");
        result.put("applicationNumber", app.getApplicationNumber());
        result.put("marks",             marks);
        result.put("status",            app.getStatus().name());
        return result;
    }

    // ── STEP 6: Flag / unflag an application ─────────────────
    @Transactional
    public Map<String, Object> toggleFlag(Long applicationId,
                                          boolean flagged,
                                          String flagReason,
                                          String judgeUsername) {
        Judge judge = judgeRepo.findByUsername(judgeUsername)
                .orElseThrow(() -> new RuntimeException("Judge not found"));

        Application app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (app.getAssignedJudge() == null ||
            !app.getAssignedJudge().getId().equals(judge.getId())) {
            throw new RuntimeException("Access denied");
        }

        app.setFlagged(flagged);
        app.setFlagReason(flagReason);
        if (flagged) {
            app.setStatus(ApplicationStatus.FLAGGED);
        } else if (app.getTotalMarks() != null) {
            app.setStatus(ApplicationStatus.SCORED);
        } else {
            app.setStatus(ApplicationStatus.UNDER_REVIEW);
        }
        applicationRepo.save(app);

        Map<String, Object> result = new HashMap<>();
        result.put("message", flagged ? "Application flagged" : "Flag removed");
        result.put("isFlagged", flagged);
        return result;
    }

    // ── Get ranked list for judge's category ─────────────────
    public List<Map<String, Object>> getRankedList(String judgeUsername) {
        Judge judge = judgeRepo.findByUsername(judgeUsername)
                .orElseThrow(() -> new RuntimeException("Judge not found"));

        return applicationRepo.findRankedByCategory(judge.getCategory())
                .stream()
                .map(a -> {
                    Map<String, Object> m = toMap(a);
                    m.put("rankInCategory", a.getRankInCategory());
                    return m;
                })
                .toList();
    }

    // ── Recalculate rankings for a category ──────────────────
    private void recalculateRankings(ApplicationCategory category) {
        List<Application> ranked = applicationRepo.findRankedByCategory(category);
        for (int i = 0; i < ranked.size(); i++) {
            ranked.get(i).setRankInCategory(i + 1);
            applicationRepo.save(ranked.get(i));
        }
    }

    // ── Summary stats for judge dashboard ────────────────────
    public Map<String, Object> getStats(String judgeUsername) {
        Judge judge = judgeRepo.findByUsername(judgeUsername)
                .orElseThrow(() -> new RuntimeException("Judge not found"));

        List<Application> all = applicationRepo
                .findByCategoryAndAssignedJudgeId(judge.getCategory(), judge.getId());

        long total    = all.size();
        long scored   = all.stream().filter(a -> a.getTotalMarks() != null).count();
        long pending  = all.stream().filter(a -> a.getTotalMarks() == null
                           && !a.isFlagged()).count();
        long flagged  = all.stream().filter(Application::isFlagged).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("category",     judge.getCategory().name());
        stats.put("judgeName",    judge.getFullName());
        stats.put("total",        total);
        stats.put("scored",       scored);
        stats.put("pending",      pending);
        stats.put("flagged",      flagged);
        stats.put("completionPct", total > 0 ? Math.round((scored * 100.0) / total) : 0);
        return stats;
    }

    // ── Convert Application to summary map ───────────────────
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
        m.put("category",             a.getCategory().name());
        m.put("status",               a.getStatus().name());
        m.put("totalMarks",           a.getTotalMarks());
        m.put("rankInCategory",       a.getRankInCategory());
        m.put("isFlagged",            a.isFlagged());
        m.put("flagReason",           a.getFlagReason());
        m.put("visitComment",         a.getVisitComment());
        m.put("submittedAt",          a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : null);
        return m;
    }

    // ── Convert Application to full detail map ────────────────
    private Map<String, Object> toDetailMap(Application a) {
        Map<String, Object> m = toMap(a);
        // Add full details
        m.put("applicantNameSinhala",  a.getApplicantNameSinhala());
        m.put("contactNumber",         a.getContactNumber());
        m.put("phoneNumber",           a.getPhoneNumber());
        m.put("applicantNic",          a.getApplicantNic());
        m.put("addressLine1",          a.getAddressLine1());
        m.put("addressLine2",          a.getAddressLine2());
        m.put("addressLine3",          a.getAddressLine3());
        m.put("town",                  a.getTown());
        m.put("street",                a.getStreet());
        m.put("locationLink",          a.getLocationLink());
        m.put("birthCertNumber",       a.getBirthCertNumber());
        m.put("birthCertDivision",     a.getBirthCertDivision());
        m.put("birthCertDistrict",     a.getBirthCertDistrict());
        // Mother
        m.put("motherFullName",        a.getMotherFullName());
        m.put("motherContact",         a.getMotherContact());
        m.put("motherOccupation",      a.getMotherOccupation());
        m.put("motherPlaceOfWork",     a.getMotherPlaceOfWork());
        // Father
        m.put("fatherFullName",        a.getFatherFullName());
        m.put("fatherContact",         a.getFatherContact());
        m.put("fatherOccupation",      a.getFatherOccupation());
        m.put("fatherPlaceOfWork",     a.getFatherPlaceOfWork());
        return m;
    }
}