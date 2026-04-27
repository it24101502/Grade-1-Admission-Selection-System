// ================================================================
//  FILE: src/main/java/lk/school/admission/service/AdminService.java
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.*;
import lk.school.admission.repository.apps.ApplicationRepository;
import lk.school.admission.repository.system.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired private ApplicationRepository  appRepo;
    @Autowired private ParentRepository       parentRepo;
    @Autowired private UserRepository         userRepo;
    @Autowired private SystemUserRepository   systemUserRepo;
    @Autowired private MarkingSchemeRepository    schemeRepo;
    @Autowired private MarkingCriterionRepository criterionRepo;

    // ── Dashboard stats ───────────────────────────────────────

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public Map<String, Object> getDashboardStats() {
        List<Application> all = appRepo.findAll();
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalApplications", all.size());
        stats.put("totalParents",       parentRepo.count());
        stats.put("totalUsers",         userRepo.count());

        Map<String, Long> byStatus = new LinkedHashMap<>();
        all.stream().collect(Collectors.groupingBy(Application::getStatus, Collectors.counting()))
           .forEach(byStatus::put);
        stats.put("byStatus", byStatus);

        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (ApplicationCategory c : ApplicationCategory.values())
            byCategory.put(c.name(), all.stream().filter(a -> c.name().equals(a.getCategory())).count());
        stats.put("byCategory", byCategory);

        stats.put("scored",  all.stream().filter(a -> a.getTotalScore() != null).count());
        stats.put("pending", all.stream().filter(a -> a.getTotalScore() == null && !"REJECTED".equals(a.getStatus())).count());
        stats.put("flagged", all.stream().filter(Application::isFlagged).count());
        return stats;
    }

    // ── Applications ──────────────────────────────────────────

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public List<Map<String, Object>> getAllApplications(String category, String status) {
        List<Application> apps;
        if (category != null && !category.isBlank() && status != null && !status.isBlank())
            apps = appRepo.findByCategoryAndStatus(category.toUpperCase(), status.toUpperCase());
        else if (category != null && !category.isBlank())
            apps = appRepo.findByCategory(category.toUpperCase());
        else if (status != null && !status.isBlank())
            apps = appRepo.findByStatus(status.toUpperCase());
        else
            apps = appRepo.findAll();
        return apps.stream().map(a -> toMap(a, true)).collect(Collectors.toList());
    }

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

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public List<Map<String, Object>> getFlaggedApplications() {
        return appRepo.findByStatus("FLAGGED").stream()
            .map(a -> toMap(a, true)).collect(Collectors.toList());
    }

    @Transactional("appsTransactionManager")
    public Map<String, Object> setFlag(Long appId, String flagColor, String reason) {
        Application app = appRepo.findById(appId)
            .orElseThrow(() -> new RuntimeException("Application not found: " + appId));
        if (flagColor == null || flagColor.isBlank()) {
            app.setFlagColor(null); app.setFlagReason(null);
            app.setStatus(app.getTotalScore() != null ? "SCORED" : "UNDER_REVIEW");
        } else {
            String color = flagColor.trim().toUpperCase();
            if (!List.of("GREEN","YELLOW","RED").contains(color))
                throw new RuntimeException("flagColor must be GREEN, YELLOW, or RED");
            app.setFlagColor(color); app.setFlagReason(reason); app.setStatus("FLAGGED");
        }
        appRepo.save(app);
        return Map.of("message","Flag updated","flagColor", app.getFlagColor() != null ? app.getFlagColor() : "CLEARED");
    }

    @Transactional("appsTransactionManager")
    public Map<String, Object> overrideStatus(Long appId, String newStatus) {
        Application app = appRepo.findById(appId)
            .orElseThrow(() -> new RuntimeException("Application not found: " + appId));
        app.setStatus(newStatus.toUpperCase()); appRepo.save(app);
        return Map.of("message","Status updated to " + newStatus,
            "applicationNumber", app.getApplicationNumber() != null ? app.getApplicationNumber() : "",
            "newStatus", app.getStatus());
    }

    @Transactional("appsTransactionManager")
    public Map<String, Object> publishResults(Map<String, Integer> selectionsPerCategory) {
        int totalSelected = 0, totalRejected = 0;
        Map<String, Integer> summary = new LinkedHashMap<>();
        for (Map.Entry<String, Integer> entry : selectionsPerCategory.entrySet()) {
            String cat = entry.getKey().toUpperCase(); int selectCount = entry.getValue();
            List<Application> ranked = appRepo.findRankedByCategory(cat);
            List<Application> eligible = ranked.stream()
                .filter(a -> a.getTotalScore() != null && !a.isFlagged()).collect(Collectors.toList());
            int selected = 0;
            for (int i = 0; i < eligible.size(); i++) {
                Application app = eligible.get(i);
                if (i < selectCount) { app.setStatus("SELECTED"); app.setRankInCategory(i+1); selected++; }
                else app.setStatus("REJECTED");
            }
            appRepo.saveAll(eligible);
            totalSelected += selected; totalRejected += Math.max(0, eligible.size() - selected);
            summary.put(cat, selected);
        }
        return Map.of("message","Results published successfully",
            "totalSelected",totalSelected,"totalRejected",totalRejected,"byCategory",summary);
    }

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public List<Map<String, Object>> getUserProgress() {
        return userRepo.findAll().stream().map(user -> {
            List<Application> assigned = appRepo.findByCategoryAndAssignedUserId(
                user.getCategory().name(), user.getId());
            long total = assigned.size(), scored = assigned.stream().filter(a -> a.getTotalScore() != null).count();
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",user.getId()); m.put("name",user.getFullName());
            m.put("username",user.getUsername()); m.put("category",user.getCategory().name());
            m.put("total",total); m.put("scored",scored); m.put("pending",total-scored);
            m.put("completionPct", total>0 ? Math.round((scored*100.0)/total) : 0);
            return m;
        }).collect(Collectors.toList());
    }

    // ══════════════════════════════════════════════════════════
    //  MARKING SCHEME MANAGEMENT (admin has full DC-level access)
    // ══════════════════════════════════════════════════════════

    @Transactional(value = "systemTransactionManager", readOnly = true)
    public Map<String, Object> getSchemesSummary() {
        Map<String, Object> summary = new LinkedHashMap<>();
        for (ApplicationCategory cat : ApplicationCategory.values()) {
            Map<String, Object> info = new LinkedHashMap<>();
            schemeRepo.findByCategoryAndActiveTrue(cat).ifPresentOrElse(s -> {
                info.put("hasActiveScheme", true);
                info.put("schemeId",        s.getId());
                info.put("title",           s.getTitle());
                info.put("criteriaCount",   s.getCriteria().size());
                info.put("totalPossible",   s.getTotalPossibleMarks());
                info.put("createdAt",       s.getCreatedAt().toString());
            }, () -> info.put("hasActiveScheme", false));
            summary.put(cat.name(), info);
        }
        return summary;
    }

    @Transactional(value = "systemTransactionManager", readOnly = true)
    public Map<String, Object> getActiveScheme(String category) {
        ApplicationCategory cat = parseCategory(category);
        MarkingScheme scheme = schemeRepo.findActiveSchemeByCategoryWithCriteria(cat)
            .orElseThrow(() -> new RuntimeException("No active scheme for: " + category));
        return schemeToMap(scheme);
    }

    @Transactional("systemTransactionManager")
    public Map<String, Object> createMarkingScheme(String category, String title,
                                                    List<Map<String, Object>> criteriaData) {
        ApplicationCategory cat = parseCategory(category);
        schemeRepo.findByCategoryAndActiveTrue(cat).ifPresent(old -> { old.setActive(false); schemeRepo.save(old); });
        MarkingScheme scheme = MarkingScheme.builder().category(cat).title(title.trim()).active(true).build();
        for (int i = 0; i < criteriaData.size(); i++)
            scheme.getCriteria().add(buildCriterion(criteriaData.get(i), i, scheme));
        return schemeToMap(schemeRepo.save(scheme));
    }

    @Transactional("systemTransactionManager")
    public Map<String, Object> addCriterion(Long schemeId, Map<String, Object> data) {
        MarkingScheme scheme = schemeRepo.findById(schemeId)
            .orElseThrow(() -> new RuntimeException("Scheme not found"));
        scheme.getCriteria().add(buildCriterion(data, scheme.getCriteria().size(), scheme));
        return schemeToMap(schemeRepo.save(scheme));
    }

    @Transactional("systemTransactionManager")
    public void removeCriterion(Long criterionId) {
        MarkingCriterion mc = criterionRepo.findById(criterionId)
            .orElseThrow(() -> new RuntimeException("Criterion not found"));
        MarkingScheme scheme = mc.getScheme();
        scheme.getCriteria().remove(mc);
        for (int i = 0; i < scheme.getCriteria().size(); i++)
            scheme.getCriteria().get(i).setDisplayOrder(i);
        schemeRepo.save(scheme);
    }

    // ── Helpers ───────────────────────────────────────────────

    private MarkingCriterion buildCriterion(Map<String, Object> data, int order, MarkingScheme scheme) {
        String title   = Objects.requireNonNull(data.get("title"), "title required").toString().trim();
        String typeStr = Objects.requireNonNull(data.get("fieldType"), "fieldType required").toString().trim().toUpperCase();
        MarkFieldType fieldType;
        try { fieldType = MarkFieldType.valueOf(typeStr); }
        catch (IllegalArgumentException e) { throw new RuntimeException("Invalid fieldType: " + typeStr); }
        Double maxScore = null;
        if (fieldType != MarkFieldType.COMMENT_ONLY) {
            maxScore = Double.parseDouble(Objects.requireNonNull(data.get("maxScore"), "maxScore required").toString());
            if (maxScore <= 0) throw new RuntimeException("maxScore must be > 0");
        }
        String desc = data.containsKey("description") && data.get("description") != null
            ? data.get("description").toString().trim() : null;
        return MarkingCriterion.builder()
            .scheme(scheme).title(title).fieldType(fieldType)
            .maxScore(maxScore).description(desc).displayOrder(order).build();
    }

    private ApplicationCategory parseCategory(String cat) {
        try { return ApplicationCategory.valueOf(cat.trim().toUpperCase()); }
        catch (IllegalArgumentException e) { throw new RuntimeException("Invalid category: " + cat); }
    }

    private Map<String, Object> schemeToMap(MarkingScheme s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId()); m.put("category", s.getCategory().name());
        m.put("title", s.getTitle()); m.put("active", s.isActive());
        m.put("createdAt", s.getCreatedAt().toString());
        m.put("totalPossible", s.getTotalPossibleMarks());
        m.put("criteria", s.getCriteria().stream().map(c -> {
            Map<String, Object> cm = new LinkedHashMap<>();
            cm.put("id", c.getId()); cm.put("title", c.getTitle());
            cm.put("fieldType", c.getFieldType().name()); cm.put("maxScore", c.getMaxScore());
            cm.put("description", c.getDescription()); cm.put("displayOrder", c.getDisplayOrder());
            return cm;
        }).collect(Collectors.toList()));
        m.put("criteriaCount", s.getCriteria().size());
        return m;
    }

    private Map<String, Object> toMap(Application a, boolean includeUser) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",a.getId()); m.put("applicationNumber",a.getApplicationNumber());
        m.put("childNameEnglish",a.getChildNameEnglish()); m.put("childNameSinhala",a.getChildNameSinhala());
        m.put("applicantNameEnglish",a.getApplicantNameEnglish()); m.put("contactNumber",a.getContactNumber());
        m.put("district",a.getDistrict()); m.put("distanceFromSchoolKm",a.getDistanceFromSchoolKm());
        m.put("category",a.getCategory()); m.put("status",a.getStatus());
        m.put("totalScore",a.getTotalScore()); m.put("rankInCategory",a.getRankInCategory());
        m.put("flagColor",a.getFlagColor()); m.put("flagReason",a.getFlagReason());
        m.put("userComment",a.getUserComment());
        m.put("dateOfBirth", a.getDateOfBirth() != null ? a.getDateOfBirth().toString() : null);
        m.put("submittedAt", a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : null);
        if (includeUser && a.getAssignedUserId() != null)
            userRepo.findById(a.getAssignedUserId()).ifPresent(u -> m.put("assignedUser", u.getFullName()));
        return m;
    }
}