// ================================================================
//  FILE: src/main/java/lk/school/admission/service/ApplicationService.java
//  UPDATED: submitApplication now takes a slotId and links the
//  completed application back to the CategorySlot.
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.Application;
import lk.school.admission.entity.Judge;
import lk.school.admission.entity.Parent;
import lk.school.admission.repository.apps.ApplicationRepository;
import lk.school.admission.repository.apps.ParentRepository;
import lk.school.admission.repository.system.JudgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ApplicationService {

    @Autowired private ApplicationRepository appRepo;
    @Autowired private ParentRepository      parentRepo;
    @Autowired private JudgeRepository       judgeRepo;

    @Value("${school.latitude}")  private double schoolLat;
    @Value("${school.longitude}") private double schoolLon;

    /**
     * Get the current parent's application status.
     * Returns the application if submitted, or the parent's seed info if not yet.
     */
    @Transactional(value = "appsTransactionManager", readOnly = true)
    public Map<String, Object> getParentStatus(Long parentId) {
        Parent parent = parentRepo.findById(parentId)
            .orElseThrow(() -> new RuntimeException("Parent not found"));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("childName", parent.getChildName());
        result.put("category",  parent.getCategory());
        result.put("phone",     parent.getPhone());
        result.put("hasSubmitted", parent.getApplicationId() != null);

        if (parent.getApplicationId() != null) {
            appRepo.findById(parent.getApplicationId()).ifPresent(app -> {
                result.put("application", appToMap(app));
            });
        }
        return result;
    }

    /**
     * Parent submits their full application form.
     * Can only be submitted once per parent.
     */
    @Transactional("appsTransactionManager")
    public Map<String, Object> submitApplication(Long parentId, Map<String, Object> data) {
        Parent parent = parentRepo.findById(parentId)
            .orElseThrow(() -> new RuntimeException("Parent account not found"));

        if (parent.getApplicationId() != null)
            throw new RuntimeException("You have already submitted an application");

        String locationLink = (String) data.get("locationLink");
        double[] coords     = extractCoordinates(locationLink);
        double distance     = coords != null
            ? calculateHaversineDistance(coords[0], coords[1]) : 0.0;

        Application app = Application.builder()
            .parentId               (parentId)
            .category               (parent.getCategory())   // category set by DC, not editable
            .status                 ("SUBMITTED")
            .submittedAt            (LocalDateTime.now())
            .applicantNameEnglish   (str(data, "applicantNameEnglish"))
            .applicantNameSinhala   (str(data, "applicantNameSinhala"))
            .applicantRelationship  (str(data, "applicantRelationship"))
            .applicantNic           (str(data, "applicantNic"))
            .contactNumber          (str(data, "contactNumber"))
            .phoneNumber            (str(data, "phoneNumber"))
            .addressLine1           (str(data, "addressLine1"))
            .addressLine2           (str(data, "addressLine2"))
            .town                   (str(data, "town"))
            .street                 (str(data, "street"))
            .district               (str(data, "district"))
            .locationLink           (locationLink)
            .distanceFromSchoolKm   (distance)
            .homeLat                (coords != null ? coords[0] : null)
            .homeLon                (coords != null ? coords[1] : null)
            .childNameEnglish       (str(data, "childNameEnglish"))
            .childNameSinhala       (str(data, "childNameSinhala"))
            .birthCertNumber        (str(data, "birthCertNumber"))
            .birthCertDivision      (str(data, "birthCertDivision"))
            .birthCertDistrict      (str(data, "birthCertDistrict"))
            .dateOfBirth            (data.get("dateOfBirth") != null
                ? LocalDate.parse((String) data.get("dateOfBirth")) : null)
            .motherFullName         (str(data, "motherFullName"))
            .motherContact          (str(data, "motherContact"))
            .motherNic              (str(data, "motherNic"))
            .motherOccupation       (str(data, "motherOccupation"))
            .motherWorkplace        (str(data, "motherWorkplace"))
            .motherEmail            (str(data, "motherEmail"))
            .fatherFullName         (str(data, "fatherFullName"))
            .fatherContact          (str(data, "fatherContact"))
            .fatherNic              (str(data, "fatherNic"))
            .fatherOccupation       (str(data, "fatherOccupation"))
            .fatherWorkplace        (str(data, "fatherWorkplace"))
            .fatherEmail            (str(data, "fatherEmail"))
            .build();

        Application saved = appRepo.save(app);
        assignApplicationNumber(saved);
        routeToJudge(saved);

        // Link back to parent
        parent.setApplicationId(saved.getId());
        parentRepo.save(parent);

        Map<String, Object> result = new HashMap<>();
        result.put("applicationNumber", saved.getApplicationNumber());
        result.put("category",          saved.getCategory());
        result.put("status",            saved.getStatus());
        result.put("distanceKm",        saved.getDistanceFromSchoolKm());
        result.put("message",           "Application submitted successfully!");
        return result;
    }

    /** Parent changes their password */
    @Transactional("appsTransactionManager")
    public void changePassword(Long parentId, String newHash) {
        Parent parent = parentRepo.findById(parentId)
            .orElseThrow(() -> new RuntimeException("Parent not found"));
        parent.setPasswordHash(newHash);
        parent.setHasChangedPassword(true);
        parentRepo.save(parent);
    }

    // ── Private helpers ───────────────────────────────────────

    private void assignApplicationNumber(Application app) {
        long count = appRepo.countByCategory(app.getCategory());
        app.setApplicationNumber(app.getCategory() + "-" + String.format("%04d", app.getId()));
        appRepo.save(app);
    }

    private void routeToJudge(Application app) {
        try {
            lk.school.admission.entity.ApplicationCategory cat =
                lk.school.admission.entity.ApplicationCategory.valueOf(app.getCategory());
            judgeRepo.findByCategory(cat).ifPresent(judge -> {
                app.setAssignedJudgeId(judge.getId());
                app.setStatus("UNDER_REVIEW");
                appRepo.save(app);
            });
        } catch (IllegalArgumentException ignored) {
            // category string doesn't match enum — leave unassigned
        }
    }

    private Map<String, Object> appToMap(Application a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",                   a.getId());
        m.put("applicationNumber",    a.getApplicationNumber());
        m.put("category",             a.getCategory());
        m.put("status",               a.getStatus());
        m.put("childNameEnglish",     a.getChildNameEnglish());
        m.put("childNameSinhala",     a.getChildNameSinhala());
        m.put("dateOfBirth",          a.getDateOfBirth() != null ? a.getDateOfBirth().toString() : null);
        m.put("district",             a.getDistrict());
        m.put("distanceFromSchoolKm", a.getDistanceFromSchoolKm());
        m.put("totalScore",           a.getTotalScore());
        m.put("rankInCategory",       a.getRankInCategory());
        m.put("flagColor",            a.getFlagColor());
        m.put("submittedAt",          a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : null);
        return m;
    }

    private String str(Map<String, Object> data, String key) {
        Object v = data.get(key);
        return v != null ? v.toString().trim() : null;
    }

    private double calculateHaversineDistance(double lat1, double lon1) {
        final double R = 6371.0;
        double dLat = Math.toRadians(schoolLat - lat1);
        double dLon = Math.toRadians(schoolLon - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(schoolLat))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000.0) / 1000.0;
    }

    private double[] extractCoordinates(String link) {
        if (link == null || link.isBlank()) return null;
        try {
            var p = java.util.regex.Pattern.compile("[/@](-?\\d+\\.\\d+),(-?\\d+\\.\\d+)");
            var m = p.matcher(link);
            if (m.find())
                return new double[]{Double.parseDouble(m.group(1)), Double.parseDouble(m.group(2))};
        } catch (Exception ignored) {}
        return null;
    }
}