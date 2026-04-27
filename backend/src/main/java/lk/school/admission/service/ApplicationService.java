// ================================================================
//  FILE: src/main/java/lk/school/admission/service/ApplicationService.java
//  UPDATED: All slot and submission logic is now child-aware.
//  getSlotsForParent  → grouped by child
//  submitApplication  → requires childId + category
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.Application;
import lk.school.admission.entity.ApplicationCategory;
import lk.school.admission.entity.Parent;
import lk.school.admission.entity.ParentApplication;
import lk.school.admission.entity.ParentChild;
import lk.school.admission.repository.apps.ApplicationRepository;
import lk.school.admission.repository.system.ParentApplicationRepository;
import lk.school.admission.repository.system.ParentChildRepository;
import lk.school.admission.repository.system.ParentRepository;
import lk.school.admission.repository.system.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired private ApplicationRepository       appRepo;
    @Autowired private ParentRepository            parentRepo;
    @Autowired private ParentChildRepository       parentChildRepo;
    @Autowired private ParentApplicationRepository parentAppRepo;
    @Autowired private UserRepository              userRepo;

    @Value("${school.latitude}")  private double schoolLat;
    @Value("${school.longitude}") private double schoolLon;

    /**
     * Returns all slots for this parent, grouped by child.
     * Used to drive the parent dashboard.
     *
     * Response structure:
     * [
     *   {
     *     childId: 1,
     *     childName: "Liona Perera",
     *     slots: [
     *       { slotId, category, filled, applicationNumber?, status?, ... }
     *     ]
     *   },
     *   ...
     * ]
     */
    @Transactional(value = "appsTransactionManager", readOnly = true)
    public List<Map<String, Object>> getSlotsForParent(Long parentId) {
        parentRepo.findById(parentId)
            .orElseThrow(() -> new RuntimeException("Parent not found"));

        List<ParentChild> children = parentChildRepo.findByParentId(parentId);

        return children.stream().map(child -> {
            List<ParentApplication> slots =
                parentAppRepo.findByParentIdAndChildId(parentId, child.getId());

            List<Map<String, Object>> slotList = slots.stream().map(slot -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("slotId",    slot.getId());
                m.put("category",  slot.getCategory());
                m.put("filled",    slot.getApplicationId() != null);

                if (slot.getApplicationId() != null) {
                    appRepo.findById(slot.getApplicationId()).ifPresent(app -> {
                        m.put("applicationNumber", app.getApplicationNumber());
                        m.put("status",            app.getStatus());
                        m.put("totalScore",        app.getTotalScore());
                        m.put("flagColor",         app.getFlagColor());
                        m.put("childNameEnglish",  app.getChildNameEnglish());
                    });
                }
                return m;
            }).collect(Collectors.toList());

            Map<String, Object> childMap = new LinkedHashMap<>();
            childMap.put("childId",   child.getId());
            childMap.put("childName", child.getChildName());
            childMap.put("slots",     slotList);
            return childMap;
        }).collect(Collectors.toList());
    }

    /**
     * Full status summary for this parent.
     */
    @Transactional(value = "appsTransactionManager", readOnly = true)
    public Map<String, Object> getParentStatus(Long parentId) {
        Parent parent = parentRepo.findById(parentId)
            .orElseThrow(() -> new RuntimeException("Parent not found"));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("phone",    parent.getPhone());
        result.put("children", getSlotsForParent(parentId));
        return result;
    }

    /**
     * Parent submits application for a specific child + category slot.
     *
     * @param parentId  the logged-in parent's ID
     * @param childId   which child this application is for
     * @param category  the category slot (must be DC-assigned for this child)
     * @param data      the form fields
     */
    @Transactional("appsTransactionManager")
    public Map<String, Object> submitApplication(Long parentId, Long childId,
                                                  String category,
                                                  Map<String, Object> data) {
        parentRepo.findById(parentId)
            .orElseThrow(() -> new RuntimeException("Parent account not found"));

        ParentChild child = parentChildRepo.findById(childId)
            .orElseThrow(() -> new RuntimeException("Child not found"));

        if (!child.getParentId().equals(parentId))
            throw new RuntimeException("This child does not belong to your account.");

        ParentApplication slot = parentAppRepo
            .findByParentIdAndChildIdAndCategory(parentId, childId, category.toUpperCase())
            .orElseThrow(() -> new RuntimeException(
                "No " + category + " slot assigned for child \"" + child.getChildName() + "\""));

        if (slot.getApplicationId() != null)
            throw new RuntimeException(
                "Application already submitted for \"" + child.getChildName() +
                "\" in category " + category);

        String locationLink = (String) data.get("locationLink");
        double[] coords     = extractCoordinates(locationLink);
        double distance     = coords != null
            ? calculateHaversineDistance(coords[0], coords[1]) : 0.0;

        Application app = Application.builder()
            .parentId                (parentId)
            .category                (category.toUpperCase())
            .status                  ("SUBMITTED")
            .submittedAt             (LocalDateTime.now())
            .applicantNameEnglish    (str(data, "applicantNameEnglish"))
            .applicantNameSinhala    (str(data, "applicantNameSinhala"))
            .applicantRelationship   (str(data, "applicantRelationship"))
            .applicantNic            (str(data, "applicantNic"))
            .contactNumber           (str(data, "contactNumber"))
            .phoneNumber             (str(data, "phoneNumber"))
            .addressLine1            (str(data, "addressLine1"))
            .addressLine2            (str(data, "addressLine2"))
            .town                    (str(data, "town"))
            .street                  (str(data, "street"))
            .district                (str(data, "district"))
            .locationLink            (locationLink)
            .distanceFromSchoolKm    (distance)
            .homeLat                 (coords != null ? coords[0] : null)
            .homeLon                 (coords != null ? coords[1] : null)
            .childNameEnglish        (str(data, "childNameEnglish"))
            .childNameSinhala        (str(data, "childNameSinhala"))
            .birthCertNumber         (str(data, "birthCertNumber"))
            .birthCertDivision       (str(data, "birthCertDivision"))
            .birthCertDistrict       (str(data, "birthCertDistrict"))
            .dateOfBirth             (data.get("dateOfBirth") != null
                ? LocalDate.parse((String) data.get("dateOfBirth")) : null)
            .motherFullName          (str(data, "motherFullName"))
            .motherContact           (str(data, "motherContact"))
            .motherNic               (str(data, "motherNic"))
            .motherOccupation        (str(data, "motherOccupation"))
            .motherWorkplace         (str(data, "motherWorkplace"))
            .motherEmail             (str(data, "motherEmail"))
            .fatherFullName          (str(data, "fatherFullName"))
            .fatherContact           (str(data, "fatherContact"))
            .fatherNic               (str(data, "fatherNic"))
            .fatherOccupation        (str(data, "fatherOccupation"))
            .fatherWorkplace         (str(data, "fatherWorkplace"))
            .fatherEmail             (str(data, "fatherEmail"))
            .build();

        Application saved = appRepo.save(app);
        assignApplicationNumber(saved);
        routeToUser(saved);

        slot.setApplicationId(saved.getId());
        parentAppRepo.save(slot);

        Map<String, Object> result = new HashMap<>();
        result.put("applicationNumber", saved.getApplicationNumber());
        result.put("category",          saved.getCategory());
        result.put("childName",         child.getChildName());
        result.put("status",            saved.getStatus());
        result.put("distanceKm",        saved.getDistanceFromSchoolKm());
        result.put("message",           "Application submitted successfully!");
        return result;
    }

    @Transactional("appsTransactionManager")
    public void changePassword(Long parentId, String newHash) {
        Parent parent = parentRepo.findById(parentId)
            .orElseThrow(() -> new RuntimeException("Parent not found"));
        parent.setPasswordHash(newHash);
        parent.setHasChangedPassword(true);
        parentRepo.save(parent);
    }

    // ── Private helpers ───────────────────────────────────

    private void assignApplicationNumber(Application app) {
        app.setApplicationNumber(app.getCategory() + "-" + String.format("%04d", app.getId()));
        appRepo.save(app);
    }

    private void routeToUser(Application app) {
        try {
            ApplicationCategory cat = ApplicationCategory.valueOf(app.getCategory());
            userRepo.findByCategory(cat).ifPresent(user -> {
                app.setAssignedUserId(user.getId());
                app.setStatus("UNDER_REVIEW");
                appRepo.save(app);
            });
        } catch (IllegalArgumentException ignored) {}
    }

    private String str(Map<String, Object> data, String key) {
        Object v = data.get(key);
        return v != null ? v.toString().trim() : null;
    }

    private double calculateHaversineDistance(double lat1, double lon1) {
        final double R = 6371.0;
        double dLat = Math.toRadians(schoolLat - lat1);
        double dLon = Math.toRadians(schoolLon - lon1);
        double a = Math.sin(dLat/2)*Math.sin(dLat/2)
                 + Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(schoolLat))
                 * Math.sin(dLon/2)*Math.sin(dLon/2);
        return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 1000.0) / 1000.0;
    }

    private double[] extractCoordinates(String link) {
        if (link == null || link.isBlank()) return null;
        try {
            var p = java.util.regex.Pattern.compile("[/@](-?\\d+\\.\\d+),(-?\\d+\\.\\d+)");
            var m = p.matcher(link);
            if (m.find())
                return new double[]{Double.parseDouble(m.group(1)),
                                    Double.parseDouble(m.group(2))};
        } catch (Exception ignored) {}
        return null;
    }
}