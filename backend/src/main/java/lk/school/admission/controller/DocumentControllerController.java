// ================================================================
//  FILE: src/main/java/lk/school/admission/controller/DocumentControllerController.java
//  UPDATED: Parent registration is now a two-step check → confirm flow.
//
//  ── Parent Management ─────────────────────────────────────
//    POST   /api/dc/parents/check          Step 1: dry-run conflict check
//    POST   /api/dc/parents/confirm        Step 2: commit the registration
//    GET    /api/dc/parents                List all parents with children + slots
//    PUT    /api/dc/parents/{id}/reset-password
//    PUT    /api/dc/parents/{id}/active
//    DELETE /api/dc/slots/{slotId}         Remove an unsubmitted slot
//
//  ── Marking Scheme Management (unchanged) ─────────────────
//    GET    /api/dc/schemes/summary
//    GET    /api/dc/schemes
//    GET    /api/dc/schemes/category/{cat}
//    GET    /api/dc/schemes/category/{cat}/history
//    POST   /api/dc/schemes
//    PUT    /api/dc/schemes/{id}
//    POST   /api/dc/schemes/{id}/criteria
//    DELETE /api/dc/criteria/{criterionId}
// ================================================================
package lk.school.admission.controller;

import lk.school.admission.service.DocumentControllerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dc")
@PreAuthorize("hasAnyRole('DOCUMENT_CONTROLLER','ADMIN')")
@CrossOrigin
public class DocumentControllerController {

    @Autowired private DocumentControllerService dcService;

    // ── Step 1: Check ─────────────────────────────────────────────
    /**
     * POST /api/dc/parents/check
     *
     * Dry-run — no data is written.
     * Returns a summary of what will happen and any conflicts.
     * The DC must review this before calling /confirm.
     *
     * Body: { "phone": "0771234567", "nic": "199012345678",
     *         "childName": "Liona Perera", "category": "CO" }
     *
     * Response status field values:
     *   "NEW_PARENT"                    → new account will be created
     *   "EXISTING_PARENT_NEW_CHILD"     → existing parent, new child will be added
     *   "EXISTING_PARENT_EXISTING_CHILD"→ existing parent + child, only slot is new
     *   "ERROR"                         → conflict or duplicate — do NOT call confirm
     */
    @PostMapping("/parents/check")
    public ResponseEntity<?> checkParent(@RequestBody Map<String, String> body) {
        try {
            String phone     = required(body, "phone");
            String nic       = required(body, "nic");
            String childName = required(body, "childName");
            String category  = required(body, "category");
            Map<String, Object> result =
                dcService.checkParent(phone, nic, childName, category);

            // Return 409 if there is a conflict so the frontend can handle it distinctly
            if ("ERROR".equals(result.get("status")))
                return ResponseEntity.status(409).body(result);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Step 2: Confirm ───────────────────────────────────────────
    /**
     * POST /api/dc/parents/confirm
     *
     * Commits the registration after the DC has reviewed the check response.
     * Body is identical to /check.
     *
     * Body: { "phone": "0771234567", "nic": "199012345678",
     *         "childName": "Liona Perera", "category": "CO" }
     */
    @PostMapping("/parents/confirm")
    public ResponseEntity<?> confirmParent(@RequestBody Map<String, String> body) {
        try {
            String phone     = required(body, "phone");
            String nic       = required(body, "nic");
            String childName = required(body, "childName");
            String category  = required(body, "category");
            return ResponseEntity.ok(
                dcService.confirmCreateSlot(phone, nic, childName, category));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── List all parents ──────────────────────────────────────────
    /** GET /api/dc/parents */
    @GetMapping("/parents")
    public ResponseEntity<?> getAllParents() {
        try {
            return ResponseEntity.ok(dcService.getAllParents());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Reset password ────────────────────────────────────────────
    /** PUT /api/dc/parents/{id}/reset-password */
    @PutMapping("/parents/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id) {
        try {
            dcService.resetParentPassword(id);
            return ResponseEntity.ok(Map.of("message", "Password reset to NIC number"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Activate / deactivate ─────────────────────────────────────
    /** PUT /api/dc/parents/{id}/active  Body: { "active": true } */
    @PutMapping("/parents/{id}/active")
    public ResponseEntity<?> setActive(@PathVariable Long id,
                                       @RequestBody Map<String, Boolean> body) {
        try {
            Boolean active = body.get("active");
            if (active == null) throw new RuntimeException("'active' field is required");
            dcService.setParentActive(id, active);
            return ResponseEntity.ok(Map.of("message",
                "Account " + (active ? "activated" : "deactivated")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Remove a slot ─────────────────────────────────────────────
    /** DELETE /api/dc/slots/{slotId} — only allowed if not yet submitted */
    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<?> removeSlot(@PathVariable Long slotId) {
        try {
            dcService.removeCategorySlot(slotId);
            return ResponseEntity.ok(Map.of("message", "Slot removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Marking Scheme Management (unchanged) ─────────────────────

    @GetMapping("/schemes/summary")
    public ResponseEntity<?> getSchemesSummary() {
        try { return ResponseEntity.ok(dcService.getSchemesSummary()); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/schemes")
    public ResponseEntity<?> getAllSchemes() {
        try { return ResponseEntity.ok(dcService.getAllSchemes()); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/schemes/category/{cat}")
    public ResponseEntity<?> getActiveScheme(@PathVariable String cat) {
        try { return ResponseEntity.ok(dcService.getActiveScheme(cat)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/schemes/category/{cat}/history")
    public ResponseEntity<?> getSchemeHistory(@PathVariable String cat) {
        try { return ResponseEntity.ok(dcService.getSchemeHistory(cat)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/schemes")
    public ResponseEntity<?> createScheme(@RequestBody Map<String, Object> body) {
        try {
            String category = required(body, "category").toString();
            String title    = required(body, "title").toString();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> criteria =
                (List<Map<String, Object>>) body.getOrDefault("criteria", List.of());
            return ResponseEntity.ok(dcService.createMarkingScheme(category, title, criteria));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/schemes/{id}")
    public ResponseEntity<?> updateScheme(@PathVariable Long id,
                                          @RequestBody Map<String, Object> body) {
        try { return ResponseEntity.ok(dcService.updateScheme(id, body)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/schemes/{id}/criteria")
    public ResponseEntity<?> addCriterion(@PathVariable Long id,
                                           @RequestBody Map<String, Object> body) {
        try { return ResponseEntity.ok(dcService.addCriterion(id, body)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @DeleteMapping("/criteria/{criterionId}")
    public ResponseEntity<?> removeCriterion(@PathVariable Long criterionId) {
        try { dcService.removeCriterion(criterionId); return ResponseEntity.ok(Map.of("message", "Criterion removed")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    // ── Helper ────────────────────────────────────────────────────

    private String required(Map<?, ?> body, String key) {
        Object val = body.get(key);
        if (val == null || val.toString().isBlank())
            throw new RuntimeException("'" + key + "' is required");
        return val.toString();
    }
}