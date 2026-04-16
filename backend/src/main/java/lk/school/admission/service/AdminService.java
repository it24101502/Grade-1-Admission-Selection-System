// ================================================================
//  FILE: src/main/java/lk/school/admission/service/AdminService.java
//
//  STEP 7: Admin views all applications across categories,
//          publishes results by selecting top N per category.
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.Application;
import lk.school.admission.entity.ApplicationCategory;
import lk.school.admission.entity.Judge;
import lk.school.admission.repository.apps.ApplicationRepository;
import lk.school.admission.repository.apps.ParentRepository;
import lk.school.admission.repository.system.JudgeRepository;
import lk.school.admission.repository.system.SystemUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired private ApplicationRepository appRepo;
    @Autowired private ParentRepository      parentRepo;
    @Autowired private JudgeRepository       judgeRepo;
    @Autowired private SystemUserRepository  systemUserRepo;

    // ── Dashboard stats ───────────────────────────────────────

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public Map<String, Object> getDashboardStats() {
        List<Application> all = appRepo.findAll();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalApplications", all.size());
        stats.put("totalParents",       parentRepo.count());
        stats.put("totalJudges",        judgeRepo.count());

        // Count by status
        Map<String, Long> byStatus = new LinkedHashMap<>();
        all.stream().collect(Collectors.groupingBy(Application::getStatus, Collectors.counting()))
           .forEach((s, c) -> byStatus.put(s, c));
        stats.put("byStatus", byStatus);

        // Count by category
        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (ApplicationCategory c : ApplicationCategory.values()) {
            byCategory.put(c.name(), all.stream()
                .filter(a -> c.name().equals(a.getCategory())).count());
        }
        stats.put("byCategory", byCategory);

        long scored  = all.stream().filter(a -> a.getTotalScore() != null).count();
        long pending = all.stream().filter(a -> a.getTotalScore() == null
                            && !"REJECTED".equals(a.getStatus())).count();
        long flagged = all.stream().filter(Application::isFlagged).count();
        stats.put("scored",  scored);
        stats.put("pending", pending);
        stats.put("flagged", flagged);
        return stats;
    }

    // ── Get all applications (with optional filters) ──────────

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public List<Map<String, Object>> getAllApplications(String category, String status) {
        List<Application> apps;
        if (category != null && !category.isBlank() && status != null && !status.isBlank()) {
            apps = appRepo.findByCategoryAndStatus(category.toUpperCase(), status.toUpperCase());
        } else if (category != null && !category.isBlank()) {
            apps = appRepo.findByCategory(category.toUpperCase());
        } else if (status != null && !status.isBlank()) {
            apps = appRepo.findByStatus(status.toUpperCase());
        } else {
            apps = appRepo.findAll();
        }
        return apps.stream().map(a -> toMap(a, true)).collect(Collectors.toList());
    }

    // ── Ranked list per category ──────────────────────────────

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public Map<String, Object> getRankedByCategory(String categoryStr) {
        List<Application> ranked = appRepo.findRankedByCategory(categoryStr.toUpperCase());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("category",     categoryStr.toUpperCase());
        result.put("total",        ranked.size());
        result.put("scored",       ranked.stream().filter(a -> a.getTotalScore() != null).count());
        result.put("applications", ranked.stream().map(a -> toMap(a, true)).collect(Collectors.toList()));
        return result;
    }

    // ── Publish results ───────────────────────────────────────

    @Transactional("appsTransactionManager")
    public Map<String, Object> publishResults(Map<String, Integer> selectionsPerCategory) {
        int totalSelected = 0, totalRejected = 0;
        Map<String, Integer> summary = new LinkedHashMap<>();

        for (Map.Entry<String, Integer> entry : selectionsPerCategory.entrySet()) {
            String cat         = entry.getKey().toUpperCase();
            int    selectCount = entry.getValue();

            List<Application> ranked = appRepo.findRankedByCategory(cat);
            List<Application> eligible = ranked.stream()
                .filter(a -> a.getTotalScore() != null && !a.isFlagged())
                .collect(Collectors.toList());

            int selected = 0;
            for (int i = 0; i < eligible.size(); i++) {
                Application app = eligible.get(i);
                if (i < selectCount) {
                    app.setStatus("SELECTED");
                    app.setRankInCategory(i + 1);
                    selected++;
                } else {
                    app.setStatus("REJECTED");
                }
            }
            appRepo.saveAll(eligible);
            totalSelected += selected;
            totalRejected += Math.max(0, eligible.size() - selected);
            summary.put(cat, selected);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message",       "Results published successfully");
        result.put("totalSelected", totalSelected);
        result.put("totalRejected", totalRejected);
        result.put("byCategory",    summary);
        return result;
    }

    // ── Flagged applications ──────────────────────────────────

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public List<Map<String, Object>> getFlaggedApplications() {
        return appRepo.findByStatus("FLAGGED").stream()
            .map(a -> toMap(a, true)).collect(Collectors.toList());
    }

    // ── Admin sets flag (GREEN / YELLOW / RED / null to clear) ─

    @Transactional("appsTransactionManager")
    public Map<String, Object> setFlag(Long appId, String flagColor, String reason) {
        Application app = appRepo.findById(appId)
            .orElseThrow(() -> new RuntimeException("Application not found: " + appId));

        if (flagColor == null || flagColor.isBlank()) {
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
        return Map.of(
            "message",   "Flag updated",
            "flagColor", app.getFlagColor() != null ? app.getFlagColor() : "CLEARED"
        );
    }

    // ── Manual status override ────────────────────────────────

    @Transactional("appsTransactionManager")
    public Map<String, Object> overrideStatus(Long appId, String newStatus) {
        Application app = appRepo.findById(appId)
            .orElseThrow(() -> new RuntimeException("Application not found: " + appId));
        app.setStatus(newStatus.toUpperCase());
        appRepo.save(app);
        return Map.of(
            "message",           "Status updated to " + newStatus,
            "applicationNumber", app.getApplicationNumber() != null ? app.getApplicationNumber() : "",
            "newStatus",         app.getStatus()
        );
    }

    // ── Judge progress ────────────────────────────────────────

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public List<Map<String, Object>> getJudgeProgress() {
        return judgeRepo.findAll().stream().map(judge -> {
            List<Application> assigned = appRepo.findByCategoryAndAssignedJudgeId(
                judge.getCategory().name(), judge.getId());
            long total  = assigned.size();
            long scored = assigned.stream().filter(a -> a.getTotalScore() != null).count();

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",            judge.getId());
            m.put("name",          judge.getFullName());
            m.put("username",      judge.getUsername());
            m.put("category",      judge.getCategory().name());
            m.put("total",         total);
            m.put("scored",        scored);
            m.put("pending",       total - scored);
            m.put("completionPct", total > 0 ? Math.round((scored * 100.0) / total) : 0);
            return m;
        }).collect(Collectors.toList());
    }

    // ── toMap ─────────────────────────────────────────────────

    private Map<String, Object> toMap(Application a, boolean includeJudgeName) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",                   a.getId());
        m.put("applicationNumber",    a.getApplicationNumber());
        m.put("childNameEnglish",     a.getChildNameEnglish());
        m.put("childNameSinhala",     a.getChildNameSinhala());
        m.put("applicantNameEnglish", a.getApplicantNameEnglish());
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
        m.put("dateOfBirth",          a.getDateOfBirth() != null ? a.getDateOfBirth().toString() : null);
        m.put("submittedAt",          a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : null);

        if (includeJudgeName && a.getAssignedJudgeId() != null) {
            judgeRepo.findById(a.getAssignedJudgeId())
                .ifPresent(j -> m.put("assignedJudge", j.getFullName()));
        }
        return m;
    }
}