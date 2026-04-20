package com.app.controller;

import com.app.security.enums.Role;
import com.app.security.service.RoleValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Sample controller demonstrating role-based access control.
 * Each endpoint is locked down to specific roles.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RoleAccessController {

    private final RoleValidationService roleValidationService;

    // ─────────────────────────────────────────────
    //  ADMIN
    // ─────────────────────────────────────────────

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> adminDashboard() {
        return ResponseEntity.ok(Map.of(
            "message", "Welcome, Admin",
            "user", roleValidationService.getCurrentUsername()
        ));
    }

    @DeleteMapping("/admin/users/{userId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of(
            "message", "User " + userId + " deleted by Admin"
        ));
    }

    // ─────────────────────────────────────────────
    //  JUDGE
    // ─────────────────────────────────────────────

    @GetMapping("/cases/{caseId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_JUDGE')")
    public ResponseEntity<?> getCase(@PathVariable Long caseId) {
        return ResponseEntity.ok(Map.of(
            "caseId", caseId,
            "message", "Case details retrieved",
            "accessedBy", roleValidationService.getCurrentUsername()
        ));
    }

    @PostMapping("/cases/{caseId}/verdict")
    @PreAuthorize("hasAuthority('ROLE_JUDGE')")
    public ResponseEntity<?> submitVerdict(@PathVariable Long caseId,
                                           @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of(
            "caseId", caseId,
            "verdict", body.getOrDefault("verdict", ""),
            "submittedBy", roleValidationService.getCurrentUsername()
        ));
    }

    // ─────────────────────────────────────────────
    //  PARENT
    // ─────────────────────────────────────────────

    @GetMapping("/children/{childId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_PARENT')")
    public ResponseEntity<?> getChildRecord(@PathVariable Long childId) {
        return ResponseEntity.ok(Map.of(
            "childId", childId,
            "message", "Child record retrieved",
            "parent", roleValidationService.getCurrentUsername()
        ));
    }

    // ─────────────────────────────────────────────
    //  DOCUMENT CONTROLLER
    // ─────────────────────────────────────────────

    @PostMapping("/documents/upload")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_DOCUMENT_CONTROLLER')")
    public ResponseEntity<?> uploadDocument(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of(
            "message", "Document uploaded successfully",
            "uploadedBy", roleValidationService.getCurrentUsername(),
            "fileName", body.getOrDefault("fileName", "")
        ));
    }

    @GetMapping("/documents/{docId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_JUDGE','ROLE_DOCUMENT_CONTROLLER')")
    public ResponseEntity<?> getDocument(@PathVariable Long docId) {
        return ResponseEntity.ok(Map.of(
            "docId", docId,
            "message", "Document retrieved"
        ));
    }

    // ─────────────────────────────────────────────
    //  Programmatic role check example
    // ─────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        // Example of programmatic enforcement inside a method
        roleValidationService.enforceRole(Role.ADMIN, Role.JUDGE, Role.PARENT, Role.DOCUMENT_CONTROLLER);
        return ResponseEntity.ok(Map.of(
            "user", roleValidationService.getCurrentUsername(),
            "roles", roleValidationService.getCurrentUserRoles()
        ));
    }
}
