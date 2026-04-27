// ================================================================
//  FILE: src/main/java/lk/school/admission/controller/ParentController.java
//  UPDATED: submitApplication now requires childId in the URL path.
//
//  GET  /api/parent/slots                          → all children + slots
//  GET  /api/parent/status                         → full status summary
//  POST /api/parent/application/{childId}/{cat}    → submit for a specific child + category
//  PUT  /api/parent/change-password
// ================================================================
package lk.school.admission.controller;

import lk.school.admission.entity.Parent;
import lk.school.admission.repository.system.ParentRepository;
import lk.school.admission.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/parent")
@PreAuthorize("hasRole('PARENT')")
@CrossOrigin
public class ParentController {

    @Autowired private ApplicationService appService;
    @Autowired private ParentRepository   parentRepo;
    @Autowired private PasswordEncoder    passwordEncoder;

    /**
     * GET /api/parent/slots
     * Returns all children and their category slots for the dashboard.
     * Response is grouped by child:
     * [
     *   { childId, childName, slots: [{ slotId, category, filled, ... }] },
     *   ...
     * ]
     */
    @GetMapping("/slots")
    public ResponseEntity<?> getMySlots(Authentication auth) {
        try {
            Long parentId = resolveParentId(auth);
            return ResponseEntity.ok(appService.getSlotsForParent(parentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/parent/status
     * Full status summary grouped by child.
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus(Authentication auth) {
        try {
            Long parentId = resolveParentId(auth);
            return ResponseEntity.ok(appService.getParentStatus(parentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/parent/application/{childId}/{category}
     *
     * Submit application form for a specific child + category slot.
     * Both childId and category must match a DC-assigned slot for this parent.
     *
     * Example: POST /api/parent/application/2/CO
     *   → submits the CO application for child with id=2
     */
    @PostMapping("/application/{childId}/{category}")
    public ResponseEntity<?> submitApplication(
            @PathVariable Long childId,
            @PathVariable String category,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        try {
            Long parentId = resolveParentId(auth);
            return ResponseEntity.ok(
                appService.submitApplication(parentId, childId, category.toUpperCase(), body));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/parent/change-password
     * Body: { "currentPassword": "...", "newPassword": "..." }
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> body,
            Authentication auth) {
        try {
            Parent parent = parentRepo.findByPhone(auth.getName())
                .orElseThrow(() -> new RuntimeException("Account not found"));

            String current = body.get("currentPassword");
            String newPwd  = body.get("newPassword");

            if (current == null || !passwordEncoder.matches(current, parent.getPasswordHash()))
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Current password is incorrect"));

            if (newPwd == null || newPwd.length() < 8)
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "New password must be at least 8 characters"));

            appService.changePassword(parent.getId(), passwordEncoder.encode(newPwd));
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Long resolveParentId(Authentication auth) {
        return parentRepo.findByPhone(auth.getName())
            .orElseThrow(() -> new RuntimeException("Parent not found"))
            .getId();
    }
}