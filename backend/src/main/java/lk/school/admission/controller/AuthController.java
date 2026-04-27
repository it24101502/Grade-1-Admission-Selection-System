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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

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
        String username = body != null ? body.get("username") : null;
        String password = body != null ? body.get("password") : null;
        if (username == null || username.isBlank() || password == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username and password are required"));
        }
        try {
            Map<String, Object> result = authService.login(username, password);
            return ResponseEntity.ok(result);
        } catch (org.springframework.security.core.AuthenticationException e) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of("error", "Invalid username or password"));
        } catch (Exception e) {
            log.warn("Login failed after authentication (check JWT secret length / algorithm): {}", e.toString());
            return ResponseEntity
                    .status(500)
                    .body(Map.of("error", "Login could not be completed. Check server logs."));
        }
    }
}