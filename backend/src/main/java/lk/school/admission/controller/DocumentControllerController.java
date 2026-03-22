// ================================================================
//  FILE: src/main/java/lk/school/admission/controller/DocumentControllerController.java
//
//  API endpoints accessible ONLY by the Document Controller.
//  Base path: /api/dc/
// ================================================================
package lk.school.admission.controller;

import lk.school.admission.service.DocumentControllerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dc")
@PreAuthorize("hasRole('DOCUMENT_CONTROLLER')")
@CrossOrigin
public class DocumentControllerController {

    @Autowired private DocumentControllerService dcService;

    /**
     * POST /api/dc/create-login
     * Create a new applicant login account.
     *
     * Request body:
     * {
     *   "fullName": "Priya Fernando",
     *   "email":    "priya@gmail.com",
     *   "nic":      "199012345678"
     * }
     *
     * Response:
     * {
     *   "id":       1,
     *   "fullName": "Priya Fernando",
     *   "email":    "priya@gmail.com",
     *   "message":  "Login created. Send the applicant this link: ..."
     * }
     */
    @PostMapping("/create-login")
    public ResponseEntity<?> createLogin(@RequestBody Map<String, String> body) {
        try {
            Map<String, Object> result = dcService.createParentLogin(
                    body.get("fullName"),
                    body.get("email"),
                    body.get("nic")
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/dc/applicants
     * Get all applicant accounts with their form status.
     */
    @GetMapping("/applicants")
    public ResponseEntity<?> getAllApplicants() {
        return ResponseEntity.ok(dcService.getAllParents());
    }

    /**
     * PUT /api/dc/applicants/{id}/reset-password
     * Reset an applicant's password back to their NIC.
     */
    @PutMapping("/applicants/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id) {
        try {
            dcService.resetParentPassword(id);
            return ResponseEntity.ok(Map.of("message", "Password reset to NIC number"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/dc/applicants/{id}/toggle-active
     * Enable or disable an applicant account.
     */
    @PutMapping("/applicants/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        try {
            dcService.toggleParentActive(id, body.get("active"));
            return ResponseEntity.ok(Map.of("message", "Account status updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}