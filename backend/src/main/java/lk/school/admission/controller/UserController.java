// ================================================================
//  FILE: src/main/java/lk/school/admission/controller/UserController.java
// ================================================================
package lk.school.admission.controller;

import lk.school.admission.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@PreAuthorize("hasAnyRole('USER','ADMIN')")
@CrossOrigin
public class UserController {

    @Autowired private UserService userService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Authentication auth) {
        try { return ResponseEntity.ok(userService.getStats(auth.getName())); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getApplications(Authentication auth) {
        try { return ResponseEntity.ok(userService.getAssignedApplications(auth.getName())); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<?> getApplicationDetail(@PathVariable Long id, Authentication auth) {
        try { return ResponseEntity.ok(userService.getApplicationDetail(id, auth.getName())); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /**
     * GET /api/user/scheme
     * Returns the active marking scheme for this user's category.
     * Used by the judge dashboard to display the scheme alongside applications.
     */
    @GetMapping("/scheme")
    public ResponseEntity<?> getScheme(Authentication auth) {
        try { return ResponseEntity.ok(userService.getSchemeForUser(auth.getName())); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /**
     * POST /api/user/applications/{id}/scores
     * Body: { "totalScore": 85.5, "comment": "Good family background" }
     *
     * NOTE: frontend calls POST /scores (plural) — kept consistent with api.js
     */
    @PostMapping("/applications/{id}/scores")
    public ResponseEntity<?> enterScore(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        try {
            Double score   = Double.parseDouble(body.get("totalScore").toString());
            String comment = body.containsKey("comment") && body.get("comment") != null
                ? body.get("comment").toString() : "";
            return ResponseEntity.ok(userService.enterScore(id, score, comment, auth.getName()));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /**
     * PUT /api/user/applications/{id}/flag
     * Body: { "color": "RED", "reason": "Documents missing" }
     * To clear: { "color": null }
     */
    @PutMapping("/applications/{id}/flag")
    public ResponseEntity<?> setFlag(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        try {
            Object fc        = body.get("color");
            String flagColor = fc != null ? fc.toString() : null;
            String reason    = body.containsKey("reason") ? body.get("reason").toString() : null;
            return ResponseEntity.ok(userService.setFlag(id, flagColor, reason, auth.getName()));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/ranked")
    public ResponseEntity<?> getRanked(
            @RequestParam(required = false) String sortField,
            @RequestParam(required = false) String sortDir,
            Authentication auth) {
        try { return ResponseEntity.ok(userService.getRankedList(auth.getName(), sortField, sortDir)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }
}