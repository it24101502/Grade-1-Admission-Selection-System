// ================================================================
//  Parent-facing API: submit application, list own applications,
//  change password. Secured by ROLE_PARENT + JWT.
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parent")
@CrossOrigin
@PreAuthorize("hasRole('PARENT')")
public class ParentController {

    @Autowired private ApplicationService applicationService;
    @Autowired private ParentRepository   parentRepo;
    @Autowired private PasswordEncoder    passwordEncoder;

    private Parent currentParent(Authentication auth) {
        return parentRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Parent account not found"));
    }

    /** POST /api/parent/applications — body matches ApplicationService.submitApplication keys */
    @PostMapping("/applications")
    public ResponseEntity<?> submitApplication(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        try {
            Parent p = currentParent(auth);
            Map<String, Object> result = applicationService.submitApplication(p.getId(), body);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/applications")
    public ResponseEntity<List<Map<String, Object>>> myApplications(Authentication auth) {
        Parent p = currentParent(auth);
        return ResponseEntity.ok(applicationService.getByParent(p.getId()));
    }

    /** Body: { "currentPassword": "...", "newPassword": "..." } */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            Authentication auth,
            @RequestBody Map<String, String> body) {
        String current = body.get("currentPassword");
        String next = body.get("newPassword");
        if (current == null || next == null || next.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "New password must be at least 8 characters"));
        }
        try {
            Parent p = currentParent(auth);
            if (!passwordEncoder.matches(current, p.getPasswordHash())) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Current password is incorrect"));
            }
            p.setPasswordHash(passwordEncoder.encode(next));
            p.setHasChangedPassword(true);
            parentRepo.save(p);
            return ResponseEntity.ok(Map.of("message", "Password updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
