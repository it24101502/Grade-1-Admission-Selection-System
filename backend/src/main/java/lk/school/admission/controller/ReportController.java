// ================================================================
//  FILE: src/main/java/lk/school/admission/controller/ReportController.java
//
//  Report endpoints available to USER and ADMIN roles.
//
//  GET  /api/report/fields
//       Returns all available columns (key + label) for the UI dropdown.
//       Accessible to both USER and ADMIN.
//
//  POST /api/report/user
//       Body: { "fields": ["childNameEnglish", "district", ...] }
//       USER only — generates a report scoped to their own category.
//       applicationNumber always included automatically.
//
//  POST /api/report/admin
//       Body: { "fields": [...], "category": "CO", "status": "SCORED" }
//       ADMIN only — generates a report across all (or a filtered) category.
//       category and status are optional filters.
// ================================================================
package lk.school.admission.controller;

import lk.school.admission.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/report")
@CrossOrigin
public class ReportController {

    @Autowired private ReportService reportService;

    /**
     * GET /api/report/fields
     * Returns the full list of selectable columns so the frontend
     * can populate the column-picker dropdown.
     * Accessible to both USER and ADMIN.
     */
    @GetMapping("/fields")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<?> getAvailableFields() {
        try {
            return ResponseEntity.ok(reportService.getAvailableFields());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/report/user
     * Generates a report for the logged-in user's category.
     *
     * Request body:
     * {
     *   "fields": ["childNameEnglish", "district", "totalScore"]
     * }
     *
     * Response:
     * {
     *   "scope": "CO",
     *   "totalRows": 42,
     *   "columns": [{ "key": "applicationNumber", "label": "Application Number" }, ...],
     *   "rows": [{ "applicationNumber": "CO-0001", "childNameEnglish": "Liona Perera", ... }],
     *   "generatedAt": "2025-08-01T10:30:00"
     * }
     */
    @PostMapping("/user")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<?> generateUserReport(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        try {
            @SuppressWarnings("unchecked")
            List<String> fields = (List<String>) body.getOrDefault("fields", List.of());
            return ResponseEntity.ok(
                reportService.generateUserReport(auth.getName(), fields));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/report/admin
     * Generates a report across all categories (or a filtered subset).
     *
     * Request body:
     * {
     *   "fields":   ["childNameEnglish", "district", "totalScore"],
     *   "category": "CO",    // optional
     *   "status":   "SCORED" // optional
     * }
     */
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> generateAdminReport(
            @RequestBody Map<String, Object> body) {
        try {
            @SuppressWarnings("unchecked")
            List<String> fields   = (List<String>) body.getOrDefault("fields", List.of());
            String category = body.containsKey("category") ? (String) body.get("category") : null;
            String status   = body.containsKey("status")   ? (String) body.get("status")   : null;
            return ResponseEntity.ok(
                reportService.generateAdminReport(fields, category, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}