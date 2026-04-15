// ================================================================
//  FILE: src/main/java/lk/school/admission/controller/ParentController.java
//  UPDATED: submitApplication now requires slotId in the URL.
// ================================================================
package lk.school.admission.controller;

import lk.school.admission.entity.Parent;
import lk.school.admission.repository.ParentRepository;
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

    @Autowired private ApplicationService applicationService;
    @Autowired private ParentRepository   parentRepo;
    @Autowired private PasswordEncoder    passwordEncoder;

    // GET /api/parent/slots
    // Returns all category slots assigned to this parent (the dashboard list)
    @GetMapping("/slots")
    public ResponseEntity<?> getMySlots(Authentication auth) {
        try {
            Long parentId = getParentId(auth);
            return ResponseEntity.ok(applicationService.getSlotsForParent(parentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // POST /api/parent/slots/{slotId}/apply
    // Submit an application for a specific category slot
    @PostMapping("/slots/{slotId}/apply")
    public ResponseEntity<?> submitForSlot(
            @PathVariable Long slotId,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        try {
            Long parentId = getParentId(auth);
            return ResponseEntity.ok(
                applicationService.submitApplication(parentId, slotId, body));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/parent/applications (kept for backwards compatibility)
    @GetMapping("/applications")
    public ResponseEntity<?> getMyApplications(Authentication auth) {
        try {
            Long parentId = getParentId(auth);
            return ResponseEntity.ok(applicationService.getByParent(parentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/parent/change-password
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> body,
            Authentication auth) {
        try {
            Parent parent = parentRepo.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Account not found"));

            if (!passwordEncoder.matches(body.get("currentPassword"), parent.getPasswordHash()))
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Current password is incorrect"));

            String newPwd = body.get("newPassword");
            if (newPwd == null || newPwd.length() < 8)
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Password must be at least 8 characters"));

            parent.setPasswordHash(passwordEncoder.encode(newPwd));
            parent.setHasChangedPassword(true);
            parentRepo.save(parent);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Long getParentId(Authentication auth) {
        return parentRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Parent not found"))
                .getId();
    }
}