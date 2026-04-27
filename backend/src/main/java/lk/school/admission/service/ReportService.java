// ================================================================
//  FILE: src/main/java/lk/school/admission/service/ReportService.java
//
//  Generates custom reports for USER and ADMIN roles.
//
//  USER:
//    - Can only see applications in their own category.
//    - applicationNumber is always included (default column).
//    - All other Application fields are selectable.
//
//  ADMIN:
//    - Can see all applications across all categories.
//    - Can optionally filter by category.
//    - applicationNumber is always included.
//    - All other Application fields are selectable.
//
//  The caller passes a list of field keys (matching Application
//  entity field names in camelCase). The service validates them
//  against the ALLOWED_FIELDS whitelist and returns only those
//  columns plus applicationNumber.
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.Application;
import lk.school.admission.repository.apps.ApplicationRepository;
import lk.school.admission.repository.system.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired private ApplicationRepository appRepo;
    @Autowired private UserRepository        userRepo;

    // ── All fields available for selection (camelCase = field name) ──
    // Displayed label → field key (what the DB/entity holds)
    public static final LinkedHashMap<String, String> AVAILABLE_FIELDS = new LinkedHashMap<>();
    static {
        // Applicant
        AVAILABLE_FIELDS.put("Applicant Name (English)",    "applicantNameEnglish");
        AVAILABLE_FIELDS.put("Applicant Name (Sinhala)",    "applicantNameSinhala");
        AVAILABLE_FIELDS.put("Applicant Relationship",      "applicantRelationship");
        AVAILABLE_FIELDS.put("Applicant NIC",               "applicantNic");
        AVAILABLE_FIELDS.put("Contact Number",              "contactNumber");
        AVAILABLE_FIELDS.put("Phone Number",                "phoneNumber");
        // Address
        AVAILABLE_FIELDS.put("Address Line 1",              "addressLine1");
        AVAILABLE_FIELDS.put("Address Line 2",              "addressLine2");
        AVAILABLE_FIELDS.put("Town",                        "town");
        AVAILABLE_FIELDS.put("Street",                      "street");
        AVAILABLE_FIELDS.put("District",                    "district");
        AVAILABLE_FIELDS.put("Distance from School (km)",   "distanceFromSchoolKm");
        // Child
        AVAILABLE_FIELDS.put("Child Name (English)",        "childNameEnglish");
        AVAILABLE_FIELDS.put("Child Name (Sinhala)",        "childNameSinhala");
        AVAILABLE_FIELDS.put("Date of Birth",               "dateOfBirth");
        AVAILABLE_FIELDS.put("Birth Certificate Number",    "birthCertNumber");
        AVAILABLE_FIELDS.put("Birth Certificate Division",  "birthCertDivision");
        AVAILABLE_FIELDS.put("Birth Certificate District",  "birthCertDistrict");
        // Mother
        AVAILABLE_FIELDS.put("Mother Full Name",            "motherFullName");
        AVAILABLE_FIELDS.put("Mother Contact",              "motherContact");
        AVAILABLE_FIELDS.put("Mother NIC",                  "motherNic");
        AVAILABLE_FIELDS.put("Mother Occupation",           "motherOccupation");
        AVAILABLE_FIELDS.put("Mother Workplace",            "motherWorkplace");
        AVAILABLE_FIELDS.put("Mother Email",                "motherEmail");
        // Father
        AVAILABLE_FIELDS.put("Father Full Name",            "fatherFullName");
        AVAILABLE_FIELDS.put("Father Contact",              "fatherContact");
        AVAILABLE_FIELDS.put("Father NIC",                  "fatherNic");
        AVAILABLE_FIELDS.put("Father Occupation",           "fatherOccupation");
        AVAILABLE_FIELDS.put("Father Workplace",            "fatherWorkplace");
        AVAILABLE_FIELDS.put("Father Email",                "fatherEmail");
        // Status / Scoring
        AVAILABLE_FIELDS.put("Category",                    "category");
        AVAILABLE_FIELDS.put("Status",                      "status");
        AVAILABLE_FIELDS.put("Total Score",                 "totalScore");
        AVAILABLE_FIELDS.put("Rank in Category",            "rankInCategory");
        AVAILABLE_FIELDS.put("Flag Color",                  "flagColor");
        AVAILABLE_FIELDS.put("Flag Reason",                 "flagReason");
        AVAILABLE_FIELDS.put("User Comment",                "userComment");
        // Timestamps
        AVAILABLE_FIELDS.put("Submitted At",                "submittedAt");
    }

    // Reverse map: fieldKey → display label
    private static final Map<String, String> FIELD_LABELS = AVAILABLE_FIELDS.entrySet()
        .stream().collect(Collectors.toMap(Map.Entry::getValue, Map.Entry::getKey));

    // ── Metadata endpoint (returns available columns for the UI) ──

    public Map<String, Object> getAvailableFields() {
        List<Map<String, String>> fields = new ArrayList<>();
        AVAILABLE_FIELDS.forEach((label, key) ->
            fields.add(Map.of("key", key, "label", label)));
        return Map.of("fields", fields);
    }

    // ── USER report (only their assigned category) ────────────────

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public Map<String, Object> generateUserReport(String username, List<String> requestedFields) {
        var user = userRepo.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        List<Application> apps = appRepo.findByCategoryAndAssignedUserId(
            user.getCategory().name(), user.getId());

        List<String> validFields = sanitiseFields(requestedFields);
        List<Map<String, Object>> rows = apps.stream()
            .map(a -> buildRow(a, validFields))
            .collect(Collectors.toList());

        return buildResponse(rows, validFields, user.getCategory().name(), apps.size());
    }

    // ── ADMIN report (all categories or filtered) ─────────────────

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public Map<String, Object> generateAdminReport(List<String> requestedFields,
                                                    String categoryFilter,
                                                    String statusFilter) {
        List<Application> apps;
        if (categoryFilter != null && !categoryFilter.isBlank() &&
            statusFilter   != null && !statusFilter.isBlank())
            apps = appRepo.findByCategoryAndStatus(categoryFilter.toUpperCase(), statusFilter.toUpperCase());
        else if (categoryFilter != null && !categoryFilter.isBlank())
            apps = appRepo.findByCategory(categoryFilter.toUpperCase());
        else if (statusFilter != null && !statusFilter.isBlank())
            apps = appRepo.findByStatus(statusFilter.toUpperCase());
        else
            apps = appRepo.findAll();

        List<String> validFields = sanitiseFields(requestedFields);
        List<Map<String, Object>> rows = apps.stream()
            .map(a -> buildRow(a, validFields))
            .collect(Collectors.toList());

        String scope = (categoryFilter != null && !categoryFilter.isBlank())
            ? categoryFilter.toUpperCase() : "ALL";
        return buildResponse(rows, validFields, scope, apps.size());
    }

    // ── Helpers ───────────────────────────────────────────────────

    /**
     * Filter out any keys not in the whitelist.
     * applicationNumber is never requested explicitly — it is always injected.
     */
    private List<String> sanitiseFields(List<String> requested) {
        Set<String> allowed = new HashSet<>(AVAILABLE_FIELDS.values());
        if (requested == null || requested.isEmpty())
            return new ArrayList<>(AVAILABLE_FIELDS.values());
        return requested.stream()
            .filter(allowed::contains)
            .collect(Collectors.toList());
    }

    /**
     * Build one report row for an application.
     * applicationNumber is always the first column.
     */
    private Map<String, Object> buildRow(Application a, List<String> fields) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("applicationNumber", a.getApplicationNumber()); // always first

        for (String field : fields) {
            Object value = switch (field) {
                case "applicantNameEnglish"   -> a.getApplicantNameEnglish();
                case "applicantNameSinhala"   -> a.getApplicantNameSinhala();
                case "applicantRelationship"  -> a.getApplicantRelationship();
                case "applicantNic"           -> a.getApplicantNic();
                case "contactNumber"          -> a.getContactNumber();
                case "phoneNumber"            -> a.getPhoneNumber();
                case "addressLine1"           -> a.getAddressLine1();
                case "addressLine2"           -> a.getAddressLine2();
                case "town"                   -> a.getTown();
                case "street"                 -> a.getStreet();
                case "district"               -> a.getDistrict();
                case "distanceFromSchoolKm"   -> a.getDistanceFromSchoolKm();
                case "childNameEnglish"       -> a.getChildNameEnglish();
                case "childNameSinhala"       -> a.getChildNameSinhala();
                case "dateOfBirth"            -> a.getDateOfBirth() != null ? a.getDateOfBirth().toString() : null;
                case "birthCertNumber"        -> a.getBirthCertNumber();
                case "birthCertDivision"      -> a.getBirthCertDivision();
                case "birthCertDistrict"      -> a.getBirthCertDistrict();
                case "motherFullName"         -> a.getMotherFullName();
                case "motherContact"          -> a.getMotherContact();
                case "motherNic"              -> a.getMotherNic();
                case "motherOccupation"       -> a.getMotherOccupation();
                case "motherWorkplace"        -> a.getMotherWorkplace();
                case "motherEmail"            -> a.getMotherEmail();
                case "fatherFullName"         -> a.getFatherFullName();
                case "fatherContact"          -> a.getFatherContact();
                case "fatherNic"              -> a.getFatherNic();
                case "fatherOccupation"       -> a.getFatherOccupation();
                case "fatherWorkplace"        -> a.getFatherWorkplace();
                case "fatherEmail"            -> a.getFatherEmail();
                case "category"              -> a.getCategory();
                case "status"                -> a.getStatus();
                case "totalScore"            -> a.getTotalScore();
                case "rankInCategory"        -> a.getRankInCategory();
                case "flagColor"             -> a.getFlagColor();
                case "flagReason"            -> a.getFlagReason();
                case "userComment"           -> a.getUserComment();
                case "submittedAt"           -> a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : null;
                default -> null;
            };
            row.put(field, value);
        }
        return row;
    }

    private Map<String, Object> buildResponse(List<Map<String, Object>> rows,
                                               List<String> fields,
                                               String scope,
                                               int total) {
        // Build column metadata (label + key), applicationNumber first
        List<Map<String, String>> columns = new ArrayList<>();
        columns.add(Map.of("key", "applicationNumber", "label", "Application Number"));
        for (String f : fields)
            columns.add(Map.of("key", f, "label", FIELD_LABELS.getOrDefault(f, f)));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("scope",       scope);
        result.put("totalRows",   total);
        result.put("columns",     columns);
        result.put("rows",        rows);
        result.put("generatedAt", java.time.LocalDateTime.now().toString());
        return result;
    }
}