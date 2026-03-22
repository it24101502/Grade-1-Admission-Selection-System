// ================================================================
//  FILE: src/main/java/lk/school/admission/controller/AuthController.java
//
//  The LOGIN endpoint. Used by ALL user types.
//  POST /api/auth/login
//    Body: { "username": "...", "password": "..." }
//    For applicants: username = email, password = NIC (initially)
//    For judges:     username = judge_co, password = Judge_CO@2025
//    For admin/DC:   username = admin@school.lk, password = Admin@2025
// ================================================================
package lk.school.admission.controller;

import lk.school.admission.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired private AuthService authService;

    /**
     * POST /api/auth/login
     *
     * Request body:
     * {
     *   "username": "parent@email.com",
     *   "password": "their_nic_or_password"
     * }
     *
     * Response:
     * {
     *   "token": "eyJ...",
     *   "role": "APPLICANT",
     *   "name": "Priya Fernando",
     *   "id": 1,
     *   "email": "parent@email.com"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            Map<String, Object> result = authService.login(
                    body.get("username"),
                    body.get("password")
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of("error", "Invalid username or password"));
        }
    }
}