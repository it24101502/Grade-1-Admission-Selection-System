// ================================================================
//  FILE: src/main/java/lk/school/admission/controller/JudgeController.java
//  Base path: /api/judge/  (JUDGE role only)
// ================================================================
package lk.school.admission.controller;

import lk.school.admission.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * All user-facing endpoints.
 *
 *   GET  /api/user/stats                        → dashboard summary
 *   GET  /api/user/applications                 → all assigned applications
 *   GET  /api/user/applications/{id}            → full detail of one application
 *   PUT  /api/user/applications/{id}/score      → enter total score + comment
 *   PUT  /api/user/applications/{id}/flag       → set/clear flag (GREEN/YELLOW/RED)
 *   GET  /api/user/ranked?sortField=x&sortDir=y → ranked list with optional sorting
 */
@RestController
@RequestMapping("/api/user")
@PreAuthorize("hasAnyRole('USER','ADMIN')")
@CrossOrigin
public class UserController {

    @Autowired private UserService userService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Authentication auth) {
        try {
            return ResponseEntity.ok(userService.getStats(auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getApplications(Authentication auth) {
        try {
            return ResponseEntity.ok(userService.getAssignedApplications(auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<?> getApplicationDetail(
            @PathVariable Long id, Authentication auth) {
        try {
            return ResponseEntity.ok(userService.getApplicationDetail(id, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/user/applications/{id}/score
     * Body: { "score": 85.5, "comment": "Good family background" }
     */
    @PutMapping("/applications/{id}/score")
    public ResponseEntity<?> enterScore(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        try {
            Double score   = Double.parseDouble(body.get("score").toString());
            String comment = (String) body.getOrDefault("comment", "");
            return ResponseEntity.ok(userService.enterScore(id, score, comment, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/user/applications/{id}/flag
     * Body: { "flagColor": "RED", "reason": "Documents missing" }
     * To clear a flag: { "flagColor": null } or omit flagColor
     */
    @PutMapping("/applications/{id}/flag")
    public ResponseEntity<?> setFlag(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        try {
            Object fc       = body.get("flagColor");
            String flagColor = fc != null ? fc.toString() : null;
            String reason    = body.containsKey("reason") ? body.get("reason").toString() : null;
            return ResponseEntity.ok(userService.setFlag(id, flagColor, reason, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/user/ranked?sortField=totalScore&sortDir=desc
     * sortField options: totalScore, distance, name, dateOfBirth
     * sortDir: asc | desc  (default desc for score)
     */
    @GetMapping("/ranked")
    public ResponseEntity<?> getRanked(
            @RequestParam(required = false) String sortField,
            @RequestParam(required = false) String sortDir,
            Authentication auth) {
        try {
            return ResponseEntity.ok(userService.getRankedList(auth.getName(), sortField, sortDir));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}