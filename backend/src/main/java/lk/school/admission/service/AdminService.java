// ================================================================
//  FILE: src/main/java/lk/school/admission/service/AdminService.java
//
//  STEP 7: Admin views all applications across categories,
//          publishes results by selecting top N per category.
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.*;
import lk.school.admission.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired private ApplicationRepository applicationRepo;
    @Autowired private ParentRepository      parentRepo;
    @Autowired private JudgeRepository       judgeRepo;
    @Autowired private SystemUserRepository  systemUserRepo;

    // ── Dashboard Summary Stats ───────────────────────────────
    public Map<String, Object> getDashboardStats() {
        List<Application> all = applicationRepo.findAll();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalApplications", all.size());
        stats.put("totalParents",       parentRepo.count());
        stats.put("totalJudges",        judgeRepo.count());

        // Count by status
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (ApplicationStatus s : ApplicationStatus.values()) {
            long count = all.stream().filter(a -> a.getStatus() == s).count();
            if (count > 0) byStatus.put(s.name(), count);
        }
        stats.put("byStatus", byStatus);

        // Count by category
        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (ApplicationCategory c : ApplicationCategory.values()) {
            long count = all.stream().filter(a -> a.getCategory() == c).count();
            byCategory.put(c.name(), count);
        }
        stats.put("byCategory", byCategory);

        // Scored vs pending
        long scored  = all.stream().filter(a -> a.getTotalMarks() != null).count();
        long pending = all.stream().filter(a -> a.getTotalMarks() == null
                            && a.getStatus() != ApplicationStatus.REJECTED).count();
        long flagged = all.stream().filter(Application::isFlagged).count();
        stats.put("scored",  scored);
        stats.put("pending", pending);
        stats.put("flagged", flagged);

        return stats;
    }

    // ── Get all applications (with filters) ───────────────────
    public List<Map<String, Object>> getAllApplications(String category, String status) {
        List<Application> apps;

        if (category != null && !category.isBlank()) {
            apps = applicationRepo.findByCategory(
                    ApplicationCategory.valueOf(category.toUpperCase()));
        } else if (status != null && !status.isBlank()) {
            apps = applicationRepo.findByStatus(
                    ApplicationStatus.valueOf(status.toUpperCase()));
        } else {
            apps = applicationRepo.findAll();
        }

        return apps.stream().map(this::toMap).toList();
    }

    // ── Get ranked list per category ──────────────────────────
    public Map<String, Object> getRankedByCategory(String categoryStr) {
        ApplicationCategory category = ApplicationCategory.valueOf(categoryStr.toUpperCase());
        List<Application> ranked = applicationRepo.findRankedByCategory(category);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("category",      category.name());
        result.put("total",         ranked.size());
        result.put("scored",        ranked.stream().filter(a -> a.getTotalMarks() != null).count());
        result.put("applications",  ranked.stream().map(this::toMap).toList());
        return result;
    }

    // ── STEP 7: Publish Results ───────────────────────────────
    // Select top N applications per category, reject the rest
    @Transactional
    public Map<String, Object> publishResults(Map<String, Integer> selectionsPerCategory) {
        int totalSelected = 0;
        int totalRejected = 0;
        Map<String, Integer> summary = new LinkedHashMap<>();

        for (Map.Entry<String, Integer> entry : selectionsPerCategory.entrySet()) {
            ApplicationCategory category = ApplicationCategory.valueOf(
                    entry.getKey().toUpperCase());
            int selectCount = entry.getValue();

            // Get ranked list for this category (sorted by marks DESC, distance ASC)
            List<Application> ranked = applicationRepo.findRankedByCategory(category);

            // Only consider SCORED applications (not flagged)
            List<Application> eligible = ranked.stream()
                    .filter(a -> a.getTotalMarks() != null && !a.isFlagged())
                    .toList();

            int selected = 0;
            for (int i = 0; i < eligible.size(); i++) {
                Application app = eligible.get(i);
                if (i < selectCount) {
                    app.setStatus(ApplicationStatus.SELECTED);
                    app.setRankInCategory(i + 1);
                    selected++;
                } else {
                    app.setStatus(ApplicationStatus.REJECTED);
                }
                applicationRepo.save(app);
            }

            totalSelected += selected;
            totalRejected += Math.max(0, eligible.size() - selected);
            summary.put(category.name(), selected);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message",       "Results published successfully");
        result.put("totalSelected", totalSelected);
        result.put("totalRejected", totalRejected);
        result.put("byCategory",    summary);
        return result;
    }

    // ── Get all flagged applications ──────────────────────────
    public List<Map<String, Object>> getFlaggedApplications() {
        return applicationRepo.findByStatus(ApplicationStatus.FLAGGED)
                .stream().map(this::toMap).toList();
    }

    // ── Override application status (admin can manually change) ─
    @Transactional
    public Map<String, Object> overrideStatus(Long applicationId, String newStatus) {
        Application app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        ApplicationStatus status = ApplicationStatus.valueOf(newStatus.toUpperCase());
        app.setStatus(status);
        applicationRepo.save(app);

        Map<String, Object> result = new HashMap<>();
        result.put("message",           "Status updated to " + newStatus);
        result.put("applicationNumber", app.getApplicationNumber());
        result.put("newStatus",         status.name());
        return result;
    }

    // ── Get all judges with their progress ────────────────────
    public List<Map<String, Object>> getJudgeProgress() {
        return judgeRepo.findAll().stream().map(judge -> {
            List<Application> assigned = applicationRepo
                    .findByCategoryAndAssignedJudgeId(judge.getCategory(), judge.getId());
            long total  = assigned.size();
            long scored = assigned.stream().filter(a -> a.getTotalMarks() != null).count();

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
        }).toList();
    }

    // ── Convert to map ────────────────────────────────────────
    private Map<String, Object> toMap(Application a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",                   a.getId());
        m.put("applicationNumber",    a.getApplicationNumber());
        m.put("childNameEnglish",     a.getChildNameEnglish());
        m.put("childNameSinhala",     a.getChildNameSinhala());
        m.put("applicantNameEnglish", a.getApplicantNameEnglish());
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
        m.put("dateOfBirth",          a.getDateOfBirth() != null ? a.getDateOfBirth().toString() : null);
        m.put("submittedAt",          a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : null);
        m.put("assignedJudge",        a.getAssignedJudge() != null
                                        ? a.getAssignedJudge().getFullName() : null);
        return m;
    }
}