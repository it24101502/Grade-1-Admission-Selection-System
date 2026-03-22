// ================================================================
//  FILE: src/main/java/lk/school/admission/service/AuthService.java
//  UPDATED:
//    - ApplicantRepository → ParentRepository
//    - "applicant" references → "parent"
//    - role "APPLICANT" → "PARENT"
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.*;
import lk.school.admission.repository.*;
import lk.school.admission.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired private AuthenticationManager authManager;
    @Autowired private JwtUtils              jwtUtils;
    @Autowired private ParentRepository      parentRepo;      // UPDATED
    @Autowired private JudgeRepository       judgeRepo;
    @Autowired private SystemUserRepository  systemUserRepo;

    // ── Universal Login ───────────────────────────────────────────
    public Map<String, Object> login(String username, String password) {

        // Authenticate credentials — throws if wrong
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));
        SecurityContextHolder.getContext().setAuthentication(auth);

        String token = jwtUtils.generateToken(auth);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);

        // ── Check SystemUser (Admin / DC) ─────────────────────────
        var sysUser = systemUserRepo.findByEmail(username);
        if (sysUser.isPresent()) {
            SystemUser u = sysUser.get();
            response.put("role",  u.getRole().name());
            response.put("name",  u.getFullName());
            response.put("id",    u.getId());
            response.put("email", u.getEmail());
            return response;
        }

        // ── Check Judge ───────────────────────────────────────────
        var judge = judgeRepo.findByUsername(username);
        if (judge.isPresent()) {
            Judge j = judge.get();
            response.put("role",              "JUDGE");
            response.put("name",              j.getFullName());
            response.put("id",                j.getId());
            response.put("username",          j.getUsername());
            response.put("category",          j.getCategory().name());
            response.put("forcePasswordReset",j.isForcePasswordReset());
            return response;
        }

        // ── Check Parent (UPDATED from Applicant) ─────────────────
        var parent = parentRepo.findByEmail(username);
        if (parent.isPresent()) {
            Parent p = parent.get();
            response.put("role",               "PARENT");           // UPDATED
            response.put("name",               p.getFullName());
            response.put("id",                 p.getId());
            response.put("email",              p.getEmail());
            response.put("hasChangedPassword", p.isHasChangedPassword());
            return response;
        }

        throw new RuntimeException("User not found after authentication");
    }
}