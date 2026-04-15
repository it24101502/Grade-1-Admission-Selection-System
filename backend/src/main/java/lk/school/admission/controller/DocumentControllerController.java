// ================================================================
//  FILE: src/main/java/lk/school/admission/controller/DocumentControllerController.java
//  UPDATED: Added endpoints to manage category slots per parent.
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

    // POST /api/dc/create-login
    @PostMapping("/create-login")
    public ResponseEntity<?> createLogin(@RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(dcService.createParentLogin(
                    body.get("fullName"), body.get("email"), body.get("nic")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/dc/parents
    @GetMapping("/parents")
    public ResponseEntity<?> getAllParents() {
        return ResponseEntity.ok(dcService.getAllParents());
    }

    // POST /api/dc/parents/{id}/slots
    // Body: { "category": "CO", "displayLabel": "Chief Occupant" }
    @PostMapping("/parents/{id}/slots")
    public ResponseEntity<?> addSlot(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(dcService.addCategorySlot(
                    id,
                    body.get("category"),
                    body.getOrDefault("displayLabel", "")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/dc/slots/{slotId}
    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<?> removeSlot(@PathVariable Long slotId) {
        try {
            dcService.removeCategorySlot(slotId);
            return ResponseEntity.ok(Map.of("message", "Slot removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/dc/parents/{id}/reset-password
    @PutMapping("/parents/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id) {
        try {
            dcService.resetParentPassword(id);
            return ResponseEntity.ok(Map.of("message", "Password reset to NIC number"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/dc/parents/{id}/toggle-active
    @PutMapping("/parents/{id}/toggle-active")
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