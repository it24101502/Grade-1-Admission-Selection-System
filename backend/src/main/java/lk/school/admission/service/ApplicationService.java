// ================================================================
//  FILE: src/main/java/lk/school/admission/service/ApplicationService.java
//  UPDATED: submitApplication now takes a slotId and links the
//  completed application back to the CategorySlot.
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.*;
import lk.school.admission.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ApplicationService {

    @Autowired private ApplicationRepository  applicationRepo;
    @Autowired private ParentRepository       parentRepo;
    @Autowired private JudgeRepository        judgeRepo;
    @Autowired private CategorySlotRepository slotRepo;

    @Value("${school.latitude}")  private double schoolLat;
    @Value("${school.longitude}") private double schoolLon;

    // ── Get slots for a parent (dashboard list) ───────────────
    public List<Map<String, Object>> getSlotsForParent(Long parentId) {
        return slotRepo.findByParentId(parentId).stream().map(slot -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("slotId",        slot.getId());
            m.put("category",      slot.getCategory().name());
            m.put("displayLabel",  slot.getDisplayLabel());
            m.put("filled",        slot.getApplication() != null);
            if (slot.getApplication() != null) {
                Application app = slot.getApplication();
                m.put("applicationNumber", app.getApplicationNumber());
                m.put("status",            app.getStatus().name());
                m.put("childNameEnglish",  app.getChildNameEnglish());
                m.put("totalMarks",        app.getTotalMarks());
            }
            return m;
        }).toList();
    }

    // ── Submit application for a specific category slot ───────
    @Transactional
    public Map<String, Object> submitApplication(Long parentId,
                                                 Long slotId,
                                                 Map<String, Object> data) {
        Parent parent = parentRepo.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent account not found"));

        CategorySlot slot = slotRepo.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Category slot not found"));

        // Verify this slot belongs to this parent
        if (!slot.getParent().getId().equals(parentId)) {
            throw new RuntimeException("Access denied: slot does not belong to this parent");
        }

        // Check if already filled
        if (slot.getApplication() != null) {
            throw new RuntimeException(
                "You have already submitted an application for " + slot.getDisplayLabel());
        }

        // Extract GPS from location link
        String locationLink = (String) data.get("locationLink");
        double[] coords     = extractCoordinates(locationLink);
        double distance     = (coords != null)
                ? calculateHaversineDistance(coords[0], coords[1]) : 0.0;

        // Build application
        Application app = Application.builder()
                .applicantNameEnglish  ((String) data.get("applicantNameEnglish"))
                .applicantNameSinhala  ((String) data.get("applicantNameSinhala"))
                .applicantRelationship ((String) data.get("applicantRelationship"))
                .contactNumber         ((String) data.get("contactNumber"))
                .addressLine1          ((String) data.get("addressLine1"))
                .addressLine2          ((String) data.getOrDefault("addressLine2", ""))
                .addressLine3          ((String) data.getOrDefault("addressLine3", ""))
                .town                  ((String) data.get("town"))
                .street                ((String) data.get("street"))
                .district              ((String) data.get("district"))
                .phoneNumber           ((String) data.get("phoneNumber"))
                .applicantNic          ((String) data.get("applicantNic"))
                .locationLink          (locationLink)
                .distanceFromSchoolKm  (distance)
                .homeLat               (coords != null ? coords[0] : null)
                .homeLon               (coords != null ? coords[1] : null)
                .childNameEnglish      ((String) data.get("childNameEnglish"))
                .childNameSinhala      ((String) data.get("childNameSinhala"))
                .birthCertNumber       ((String) data.get("birthCertNumber"))
                .birthCertDivision     ((String) data.get("birthCertDivision"))
                .birthCertDistrict     ((String) data.get("birthCertDistrict"))
                .dateOfBirth           (LocalDate.parse((String) data.get("dateOfBirth")))
                .motherFullName        ((String) data.getOrDefault("motherFullName",    null))
                .motherContact         ((String) data.getOrDefault("motherContact",     null))
                .motherIdNumber        ((String) data.getOrDefault("motherIdNumber",    null))
                .motherOccupation      ((String) data.getOrDefault("motherOccupation",  null))
                .motherPlaceOfWork     ((String) data.getOrDefault("motherPlaceOfWork", null))
                .motherEmail           ((String) data.getOrDefault("motherEmail",       null))
                .fatherFullName        ((String) data.getOrDefault("fatherFullName",    null))
                .fatherContact         ((String) data.getOrDefault("fatherContact",     null))
                .fatherIdNumber        ((String) data.getOrDefault("fatherIdNumber",    null))
                .fatherOccupation      ((String) data.getOrDefault("fatherOccupation",  null))
                .fatherPlaceOfWork     ((String) data.getOrDefault("fatherPlaceOfWork", null))
                .fatherEmail           ((String) data.getOrDefault("fatherEmail",       null))
                .category              (slot.getCategory())   // from slot, not form
                .parent                (parent)
                .status                (ApplicationStatus.SUBMITTED)
                .submittedAt           (LocalDateTime.now())
                .build();

        Application saved = applicationRepo.save(app);

        // Assign application number and route to judge
        assignToJudge(saved);

        // Link the application back to the slot
        slot.setApplication(saved);
        slotRepo.save(slot);

        Map<String, Object> result = new HashMap<>();
        result.put("applicationNumber", saved.getApplicationNumber());
        result.put("category",          saved.getCategory().name());
        result.put("status",            saved.getStatus().name());
        result.put("distanceKm",        saved.getDistanceFromSchoolKm());
        result.put("message",           "Application submitted successfully!");
        return result;
    }

    // ── Get applications by parent ────────────────────────────
    public List<Map<String, Object>> getByParent(Long parentId) {
        return applicationRepo.findByParentId(parentId)
                .stream().map(this::appToMap).toList();
    }

    // ── Assign number and route to judge ─────────────────────
    private void assignToJudge(Application app) {
        long count      = applicationRepo.countByCategory(app.getCategory());
        String appNumber = app.getCategory().name() + "-" + String.format("%03d", count);
        app.setApplicationNumber(appNumber);

        judgeRepo.findByCategory(app.getCategory()).ifPresent(judge -> {
            app.setAssignedJudge(judge);
            app.setStatus(ApplicationStatus.UNDER_REVIEW);
        });

        applicationRepo.save(app);
    }

    // ── Convert to map ────────────────────────────────────────
    private Map<String, Object> appToMap(Application a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",                   a.getId());
        m.put("applicationNumber",    a.getApplicationNumber());
        m.put("applicantNameEnglish", a.getApplicantNameEnglish());
        m.put("contactNumber",        a.getContactNumber());
        m.put("district",             a.getDistrict());
        m.put("distanceFromSchoolKm", a.getDistanceFromSchoolKm());
        m.put("childNameEnglish",     a.getChildNameEnglish());
        m.put("childNameSinhala",     a.getChildNameSinhala());
        m.put("dateOfBirth",          a.getDateOfBirth() != null ? a.getDateOfBirth().toString() : null);
        m.put("category",             a.getCategory().name());
        m.put("status",               a.getStatus().name());
        m.put("totalMarks",           a.getTotalMarks());
        m.put("submittedAt",          a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : null);
        return m;
    }

    // ── Haversine distance ────────────────────────────────────
    private double calculateHaversineDistance(double lat1, double lon1) {
        final double R = 6371.0;
        double dLat = Math.toRadians(schoolLat - lat1);
        double dLon = Math.toRadians(schoolLon - lon1);
        double a    = Math.sin(dLat/2)*Math.sin(dLat/2)
                    + Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(schoolLat))
                    * Math.sin(dLon/2)*Math.sin(dLon/2);
        return Math.round(6371.0 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 1000.0) / 1000.0;
    }

    // ── Extract GPS from Google Maps link ────────────────────
    private double[] extractCoordinates(String link) {
        if (link == null || link.isBlank()) return null;
        try {
            var p = java.util.regex.Pattern.compile("[@?q=](-?\\d+\\.\\d+),(-?\\d+\\.\\d+)");
            var m = p.matcher(link);
            if (m.find())
                return new double[]{Double.parseDouble(m.group(1)), Double.parseDouble(m.group(2))};
        } catch (Exception ignored) {}
        return null;
    }
}