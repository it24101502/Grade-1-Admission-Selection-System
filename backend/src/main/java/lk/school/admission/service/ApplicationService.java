// ================================================================
//  FILE: src/main/java/lk/school/admission/service/ApplicationService.java
//  UPDATED:
//    - ApplicantRepository → ParentRepository
//    - Applicant entity → Parent entity
//    - findByApplicantId → findByParentId
//    - app.getApplicant() → app.getParent()
//    - app.setApplicant() → app.setParent()
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

    @Autowired private ApplicationRepository applicationRepo;
    @Autowired private ParentRepository      parentRepo;      // UPDATED
    @Autowired private JudgeRepository       judgeRepo;

    @Value("${school.latitude}")
    private double schoolLat;

    @Value("${school.longitude}")
    private double schoolLon;

    // ── STEP 3: Submit Application Form ───────────────────────────
    @Transactional
    public Map<String, Object> submitApplication(Long parentId, Map<String, Object> data) {

        // UPDATED: was applicantRepo, now parentRepo
        Parent parent = parentRepo.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent account not found"));

        // Check if already submitted
        var existing = applicationRepo.findByParentId(parentId);  // UPDATED
        if (!existing.isEmpty() &&
            existing.get(0).getStatus() != ApplicationStatus.FORM_PENDING) {
            throw new RuntimeException("You have already submitted an application");
        }

        // Parse the category
        ApplicationCategory category = ApplicationCategory.valueOf(
                data.get("category").toString());

        // Extract GPS coordinates from the location link
        String locationLink = (String) data.get("locationLink");
        double[] coords     = extractCoordinates(locationLink);
        double distance     = 0.0;
        if (coords != null) {
            distance = calculateHaversineDistance(coords[0], coords[1]);
        }

        // Build the Application from form data
        Application app = Application.builder()
                // Field 1
                .applicantNameEnglish  ((String) data.get("applicantNameEnglish"))
                .applicantNameSinhala  ((String) data.get("applicantNameSinhala"))
                .applicantRelationship ((String) data.get("applicantRelationship"))
                // Field 2
                .contactNumber         ((String) data.get("contactNumber"))
                // Field 3
                .addressLine1          ((String) data.get("addressLine1"))
                .addressLine2          ((String) data.getOrDefault("addressLine2", ""))
                .addressLine3          ((String) data.getOrDefault("addressLine3", ""))
                .town                  ((String) data.get("town"))
                .street                ((String) data.get("street"))
                .district              ((String) data.get("district"))
                // Field 4
                .phoneNumber           ((String) data.get("phoneNumber"))
                // Field 5
                .applicantNic          ((String) data.get("applicantNic"))
                // Field 6
                .locationLink          (locationLink)
                .distanceFromSchoolKm  (distance)
                .homeLat               (coords != null ? coords[0] : null)
                .homeLon               (coords != null ? coords[1] : null)
                // Field 7
                .childNameEnglish      ((String) data.get("childNameEnglish"))
                // Field 8
                .childNameSinhala      ((String) data.get("childNameSinhala"))
                // Field 9
                .birthCertNumber       ((String) data.get("birthCertNumber"))
                .birthCertDivision     ((String) data.get("birthCertDivision"))
                .birthCertDistrict     ((String) data.get("birthCertDistrict"))
                .dateOfBirth           (LocalDate.parse((String) data.get("dateOfBirth")))
                // Field 10 — optional
                .motherFullName        ((String) data.getOrDefault("motherFullName",    null))
                .motherContact         ((String) data.getOrDefault("motherContact",     null))
                .motherIdNumber        ((String) data.getOrDefault("motherIdNumber",    null))
                .motherOccupation      ((String) data.getOrDefault("motherOccupation",  null))
                .motherPlaceOfWork     ((String) data.getOrDefault("motherPlaceOfWork", null))
                .motherEmail           ((String) data.getOrDefault("motherEmail",       null))
                // Field 11 — optional
                .fatherFullName        ((String) data.getOrDefault("fatherFullName",    null))
                .fatherContact         ((String) data.getOrDefault("fatherContact",     null))
                .fatherIdNumber        ((String) data.getOrDefault("fatherIdNumber",    null))
                .fatherOccupation      ((String) data.getOrDefault("fatherOccupation",  null))
                .fatherPlaceOfWork     ((String) data.getOrDefault("fatherPlaceOfWork", null))
                .fatherEmail           ((String) data.getOrDefault("fatherEmail",       null))
                // Field 12
                .category              (category)
                // UPDATED: was setApplicant, now setParent
                .parent                (parent)
                .status                (ApplicationStatus.SUBMITTED)
                .submittedAt           (LocalDateTime.now())
                .build();

        // ── STEP 4: Save & assign to judge ────────────────────────
        Application saved = applicationRepo.save(app);
        assignToJudge(saved);

        Map<String, Object> result = new HashMap<>();
        result.put("applicationNumber", saved.getApplicationNumber());
        result.put("category",          saved.getCategory().name());
        result.put("status",            saved.getStatus().name());
        result.put("distanceKm",        saved.getDistanceFromSchoolKm());
        result.put("message",           "Application submitted successfully!");
        return result;
    }

    // ── Assign application number and route to judge ──────────────
    private void assignToJudge(Application app) {
        ApplicationCategory category = app.getCategory();

        long count = applicationRepo.countByCategory(category);
        String appNumber = category.name() + "-" + String.format("%03d", count);
        app.setApplicationNumber(appNumber);

        judgeRepo.findByCategory(category).ifPresent(judge -> {
            app.setAssignedJudge(judge);
            app.setStatus(ApplicationStatus.UNDER_REVIEW);
        });

        applicationRepo.save(app);
    }

    // ── Get applications by parent (UPDATED method name) ─────────
    public List<Map<String, Object>> getByParent(Long parentId) {
        return applicationRepo.findByParentId(parentId)   // UPDATED
                .stream().map(this::appToMap).toList();
    }

    // ── Get applications by judge category ────────────────────────
    public List<Map<String, Object>> getByCategory(ApplicationCategory category) {
        return applicationRepo.findByCategory(category)
                .stream().map(this::appToMap).toList();
    }

    // ── Get single application ────────────────────────────────────
    public Map<String, Object> getById(Long id) {
        return appToMap(applicationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id)));
    }

    // ── Convert to map ────────────────────────────────────────────
    private Map<String, Object> appToMap(Application a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",                   a.getId());
        m.put("applicationNumber",    a.getApplicationNumber());
        m.put("applicantNameEnglish", a.getApplicantNameEnglish());
        m.put("applicantNameSinhala", a.getApplicantNameSinhala());
        m.put("applicantRelationship",a.getApplicantRelationship());
        m.put("contactNumber",        a.getContactNumber());
        m.put("addressLine1",         a.getAddressLine1());
        m.put("town",                 a.getTown());
        m.put("district",             a.getDistrict());
        m.put("applicantNic",         a.getApplicantNic());
        m.put("locationLink",         a.getLocationLink());
        m.put("distanceFromSchoolKm", a.getDistanceFromSchoolKm());
        m.put("childNameEnglish",     a.getChildNameEnglish());
        m.put("childNameSinhala",     a.getChildNameSinhala());
        m.put("birthCertNumber",      a.getBirthCertNumber());
        m.put("dateOfBirth",          a.getDateOfBirth() != null
                                        ? a.getDateOfBirth().toString() : null);
        m.put("category",             a.getCategory().name());
        m.put("status",               a.getStatus().name());
        m.put("isFlagged",            a.isFlagged());
        m.put("totalMarks",           a.getTotalMarks());
        m.put("rankInCategory",       a.getRankInCategory());
        m.put("submittedAt",          a.getSubmittedAt() != null
                                        ? a.getSubmittedAt().toString() : null);
        return m;
    }

    // ── Haversine Distance Formula ────────────────────────────────
    private double calculateHaversineDistance(double lat1, double lon1) {
        final double R = 6371.0;
        double lat2   = schoolLat;
        double lon2   = schoolLon;
        double dLat   = Math.toRadians(lat2 - lat1);
        double dLon   = Math.toRadians(lon2 - lon1);
        double a      = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                      + Math.cos(Math.toRadians(lat1))
                      * Math.cos(Math.toRadians(lat2))
                      * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c      = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 1000.0) / 1000.0;
    }

    // ── Extract GPS Coords from Google Maps Link ──────────────────
    private double[] extractCoordinates(String link) {
        if (link == null || link.isBlank()) return null;
        try {
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(
                    "[@?q=](-?\\d+\\.\\d+),(-?\\d+\\.\\d+)");
            java.util.regex.Matcher m = p.matcher(link);
            if (m.find()) {
                return new double[]{
                    Double.parseDouble(m.group(1)),
                    Double.parseDouble(m.group(2))
                };
            }
        } catch (Exception ignored) {}
        return null;
    }
}