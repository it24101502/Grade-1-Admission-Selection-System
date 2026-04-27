// ================================================================
//  FILE: src/main/java/lk/school/admission/controller/AdminController.java
// ================================================================
package lk.school.admission.controller;

import lk.school.admission.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin
public class AdminController {

    @Autowired private AdminService adminService;

    // ── Dashboard & Applications ──────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try { return ResponseEntity.ok(adminService.getDashboardStats()); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getApplications(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        try { return ResponseEntity.ok(adminService.getAllApplications(category, status)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/ranked/{category}")
    public ResponseEntity<?> getRanked(@PathVariable String category) {
        try { return ResponseEntity.ok(adminService.getRankedByCategory(category)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/flagged")
    public ResponseEntity<?> getFlagged() {
        try { return ResponseEntity.ok(adminService.getFlaggedApplications()); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUserProgress() {
        try { return ResponseEntity.ok(adminService.getUserProgress()); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/publish-results")
    public ResponseEntity<?> publishResults(@RequestBody Map<String, Integer> selections) {
        try { return ResponseEntity.ok(adminService.publishResults(selections)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<?> overrideStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try { return ResponseEntity.ok(adminService.overrideStatus(id, body.get("status"))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PutMapping("/applications/{id}/flag")
    public ResponseEntity<?> setFlag(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Object fc = body.get("flagColor");
            String flagColor = fc != null ? fc.toString() : null;
            String reason = body.containsKey("reason") ? body.get("reason").toString() : null;
            return ResponseEntity.ok(adminService.setFlag(id, flagColor, reason));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    // ── Marking Scheme Management (same as DC) ────────────────

    /** GET /api/admin/schemes/summary */
    @GetMapping("/schemes/summary")
    public ResponseEntity<?> getSchemesSummary() {
        try { return ResponseEntity.ok(adminService.getSchemesSummary()); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /** GET /api/admin/schemes/category/{cat} */
    @GetMapping("/schemes/category/{cat}")
    public ResponseEntity<?> getActiveScheme(@PathVariable String cat) {
        try { return ResponseEntity.ok(adminService.getActiveScheme(cat)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /**
     * POST /api/admin/schemes
     * Body: { "category": "CO", "title": "...", "criteria": [...] }
     */
    @PostMapping("/schemes")
    public ResponseEntity<?> createScheme(@RequestBody Map<String, Object> body) {
        try {
            String category = body.get("category").toString();
            String title    = body.get("title").toString();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> criteria =
                (List<Map<String, Object>>) body.getOrDefault("criteria", List.of());
            return ResponseEntity.ok(adminService.createMarkingScheme(category, title, criteria));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /**
     * POST /api/admin/schemes/{id}/criteria
     * Body: { "title": "...", "fieldType": "NUMBER_ONLY", "maxScore": 30 }
     */
    @PostMapping("/schemes/{id}/criteria")
    public ResponseEntity<?> addCriterion(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try { return ResponseEntity.ok(adminService.addCriterion(id, body)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /** DELETE /api/admin/criteria/{criterionId} */
    @DeleteMapping("/criteria/{criterionId}")
    public ResponseEntity<?> removeCriterion(@PathVariable Long criterionId) {
        try { adminService.removeCriterion(criterionId); return ResponseEntity.ok(Map.of("message","Criterion removed")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }
}