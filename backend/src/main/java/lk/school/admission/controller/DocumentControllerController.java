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

import java.util.List;
import java.util.Map;

/**
 * All DC endpoints.
 * Base path: /api/dc/
 * Secured: DOCUMENT_CONTROLLER role (Admin can also call these via the service layer).
 *
 * ── Parent Management ─────────────────────────────────────
 *   POST   /api/dc/parents                           Create parent account
 *   GET    /api/dc/parents                           List all parents
 *   PUT    /api/dc/parents/{id}/reset-password       Reset password to NIC
 *   PUT    /api/dc/parents/{id}/active               Activate / deactivate account
 *
 * ── Marking Scheme Management ─────────────────────────────
 *   GET    /api/dc/schemes/summary                   Active scheme per category (overview)
 *   GET    /api/dc/schemes                           All schemes (all categories)
 *   GET    /api/dc/schemes/category/{cat}            Active scheme for one category
 *   GET    /api/dc/schemes/category/{cat}/history    All versions for a category
 *   POST   /api/dc/schemes                           Create new scheme (with criteria)
 *   PUT    /api/dc/schemes/{id}                      Update scheme title / active flag
 *   POST   /api/dc/schemes/{id}/criteria             Add a criterion to a scheme
 *   DELETE /api/dc/criteria/{criterionId}            Remove a criterion
 */
@RestController
@RequestMapping("/api/dc")
@PreAuthorize("hasAnyRole('DOCUMENT_CONTROLLER','ADMIN')")
@CrossOrigin
public class DocumentControllerController {

    @Autowired private DocumentControllerService dcService;

    // ── Parent Management ─────────────────────────────────────────

    /**
     * POST /api/dc/parents
     * Body: { "phone": "0771234567", "nic": "199012345678", "childName": "Sithum Perera", "category": "CO" }
     */
    @PostMapping("/parents")
    public ResponseEntity<?> createParent(@RequestBody Map<String, String> body) {
        try {
            String phone     = required(body, "phone");
            String nic       = required(body, "nic");
            String childName = required(body, "childName");
            String category  = required(body, "category");
            return ResponseEntity.ok(
                dcService.createParent(phone, nic, childName, category));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/dc/parents */
    @GetMapping("/parents")
    public ResponseEntity<?> getAllParents() {
        try {
            return ResponseEntity.ok(dcService.getAllParents());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/dc/parents/{id}/reset-password
     * Resets the parent's password back to their NIC number.
     */
    @PutMapping("/parents/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id) {
        try {
            dcService.resetParentPassword(id);
            return ResponseEntity.ok(Map.of("message", "Password reset to NIC number"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/dc/parents/{id}/active
     * Body: { "active": true }
     */
    @PutMapping("/parents/{id}/active")
    public ResponseEntity<?> setActive(@PathVariable Long id,
                                       @RequestBody Map<String, Boolean> body) {
        try {
            Boolean active = body.get("active");
            if (active == null) throw new RuntimeException("'active' field is required");
            dcService.setParentActive(id, active);
            return ResponseEntity.ok(Map.of("message", "Account " + (active ? "activated" : "deactivated")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Marking Scheme Management ─────────────────────────────────

    /** GET /api/dc/schemes/summary — one row per category, shows active scheme */
    @GetMapping("/schemes/summary")
    public ResponseEntity<?> getSchemesSummary() {
        try {
            return ResponseEntity.ok(dcService.getSchemesSummary());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/dc/schemes — all schemes */
    @GetMapping("/schemes")
    public ResponseEntity<?> getAllSchemes() {
        try {
            return ResponseEntity.ok(dcService.getAllSchemes());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/dc/schemes/category/{cat} — active scheme for a category */
    @GetMapping("/schemes/category/{cat}")
    public ResponseEntity<?> getActiveScheme(@PathVariable String cat) {
        try {
            return ResponseEntity.ok(dcService.getActiveScheme(cat));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/dc/schemes/category/{cat}/history — all versions for a category */
    @GetMapping("/schemes/category/{cat}/history")
    public ResponseEntity<?> getSchemeHistory(@PathVariable String cat) {
        try {
            return ResponseEntity.ok(dcService.getSchemeHistory(cat));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/dc/schemes
     * Creates a new marking scheme for a judge category.
     * Body:
     * {
     *   "category": "CO",
     *   "title":    "CO Marking Scheme 2025",
     *   "criteria": [
     *     { "title": "Distance from school", "fieldType": "NUMBER_ONLY",        "maxScore": 30, "description": "0=far, 30=very near" },
     *     { "title": "Family connection",    "fieldType": "NUMBER_AND_COMMENT", "maxScore": 40 },
     *     { "title": "General observation",  "fieldType": "COMMENT_ONLY" }
     *   ]
     * }
     */
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

    /**
     * PUT /api/dc/schemes/{id}
     * Body: { "title": "Updated title" } or { "active": false }
     */
    @PutMapping("/schemes/{id}")
    public ResponseEntity<?> updateScheme(@PathVariable Long id,
                                          @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(dcService.updateScheme(id, body));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/dc/schemes/{id}/criteria
     * Add a single criterion to an existing scheme.
     * Body: { "title": "Interview", "fieldType": "NUMBER_AND_COMMENT", "maxScore": 20 }
     */
    @PostMapping("/schemes/{id}/criteria")
    public ResponseEntity<?> addCriterion(@PathVariable Long id,
                                           @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(dcService.addCriterion(id, body));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/dc/criteria/{criterionId}
     * Remove a single criterion from its scheme.
     */
    @DeleteMapping("/criteria/{criterionId}")
    public ResponseEntity<?> removeCriterion(@PathVariable Long criterionId) {
        try {
            dcService.removeCriterion(criterionId);
            return ResponseEntity.ok(Map.of("message", "Criterion removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Helper ────────────────────────────────────────────────────

    private String required(Map<?, ?> body, String key) {
        Object val = body.get(key);
        if (val == null || val.toString().isBlank())
            throw new RuntimeException("'" + key + "' is required");
        return val.toString();
    }
}