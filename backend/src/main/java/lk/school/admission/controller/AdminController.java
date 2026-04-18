// ================================================================
//  FILE: src/main/java/lk/school/admission/controller/AdminController.java
//  Base path: /api/admin/  (ADMIN role only)
// ================================================================
package lk.school.admission.controller;

import lk.school.admission.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * All admin-facing endpoints.
 *
 *   GET  /api/admin/stats                        → dashboard summary
 *   GET  /api/admin/applications                 → all applications (filter by category/status)
 *   GET  /api/admin/ranked/{category}            → ranked list for one category
 *   GET  /api/admin/flagged                      → all flagged applications
 *   GET  /api/admin/users                       → judge progress summary
 *   POST /api/admin/publish-results              → select top N per category
 *   PUT  /api/admin/applications/{id}/status     → manually override status
 *   PUT  /api/admin/applications/{id}/flag       → set GREEN / YELLOW / RED flag
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin
public class AdminController {

    @Autowired private AdminService adminService;

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

    /**
     * POST /api/admin/publish-results
     * Body: { "CO": 10, "SIS": 5, "OG": 3, "TR": 2, "EDU": 4, "AB": 1 }
     */
    @PostMapping("/publish-results")
    public ResponseEntity<?> publishResults(@RequestBody Map<String, Integer> selections) {
        try { return ResponseEntity.ok(adminService.publishResults(selections)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /**
     * PUT /api/admin/applications/{id}/status
     * Body: { "status": "SELECTED" }
     */
    @PutMapping("/applications/{id}/status")
    public ResponseEntity<?> overrideStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        try { return ResponseEntity.ok(adminService.overrideStatus(id, body.get("status"))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /**
     * PUT /api/admin/applications/{id}/flag
     * Body: { "flagColor": "RED", "reason": "Suspicious documents" }
     * To clear: { "flagColor": null }
     */
    @PutMapping("/applications/{id}/flag")
    public ResponseEntity<?> setFlag(
            @PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Object fc        = body.get("flagColor");
            String flagColor = fc != null ? fc.toString() : null;
            String reason    = body.containsKey("reason") ? body.get("reason").toString() : null;
            return ResponseEntity.ok(adminService.setFlag(id, flagColor, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}