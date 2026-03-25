// ================================================================
//  FILE: src/main/java/lk/school/admission/controller/JudgeController.java
//  Base path: /api/judge/  (JUDGE role only)
// ================================================================
package lk.school.admission.controller;

import lk.school.admission.service.JudgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/judge")
@PreAuthorize("hasRole('JUDGE')")
@CrossOrigin
public class JudgeController {

    @Autowired private JudgeService judgeService;

    // GET /api/judge/stats
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Authentication auth) {
        try {
            return ResponseEntity.ok(judgeService.getStats(auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/judge/applications
    @GetMapping("/applications")
    public ResponseEntity<?> getApplications(Authentication auth) {
        try {
            return ResponseEntity.ok(judgeService.getAssignedApplications(auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/judge/applications/{id}
    @GetMapping("/applications/{id}")
    public ResponseEntity<?> getApplicationDetail(
            @PathVariable Long id, Authentication auth) {
        try {
            return ResponseEntity.ok(judgeService.getApplicationDetail(id, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/judge/applications/{id}/marks
    // Body: { "marks": 85.5, "visitComment": "Good family background" }
    @PutMapping("/applications/{id}/marks")
    public ResponseEntity<?> enterMarks(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        try {
            Double marks        = Double.parseDouble(body.get("marks").toString());
            String visitComment = (String) body.getOrDefault("visitComment", "");
            return ResponseEntity.ok(
                judgeService.enterMarks(id, marks, visitComment, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/judge/applications/{id}/flag
    // Body: { "flagged": true, "flagReason": "Documents missing" }
    @PutMapping("/applications/{id}/flag")
    public ResponseEntity<?> toggleFlag(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        try {
            boolean flagged    = Boolean.parseBoolean(body.get("flagged").toString());
            String  flagReason = (String) body.getOrDefault("flagReason", "");
            return ResponseEntity.ok(
                judgeService.toggleFlag(id, flagged, flagReason, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/judge/ranked
    @GetMapping("/ranked")
    public ResponseEntity<?> getRanked(Authentication auth) {
        try {
            return ResponseEntity.ok(judgeService.getRankedList(auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}