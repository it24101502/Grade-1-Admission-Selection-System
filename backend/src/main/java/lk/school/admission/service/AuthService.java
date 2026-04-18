// ================================================================
//  FILE: src/main/java/lk/school/admission/service/AuthService.java
//  UPDATED:
//    - ApplicantRepository → ParentRepository
//    - "applicant" references → "parent"
//    - role "APPLICANT" → "PARENT"
// ================================================================
// ================================================================
//  FILE: src/main/java/lk/school/admission/service/AuthService.java
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.User;
import lk.school.admission.entity.Parent;
import lk.school.admission.entity.SystemUser;
import lk.school.admission.repository.apps.ParentRepository;
import lk.school.admission.repository.system.UserRepository;
import lk.school.admission.repository.system.SystemUserRepository;
import lk.school.admission.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthService {

    @Autowired private AuthenticationManager  authManager;
    @Autowired private JwtUtils               jwtUtils;
    @Autowired private SystemUserRepository   systemUserRepo;
    @Autowired private UserRepository         userRepo;
    @Autowired private ParentRepository       parentRepo;

    /**
     * Universal login for all user types.
     *   Admin / DC  → username = email
     *   User        → username = user_co / user_sis / ...
     *   Parent      → username = phone number, password = NIC (initial)
     */
    public Map<String, Object> login(String username, String password) {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(username, password));
        SecurityContextHolder.getContext().setAuthentication(auth);

        String token = jwtUtils.generateToken(auth);
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("token", token);

        // Admin / DC
        var sysUser = systemUserRepo.findByEmail(username);
        if (sysUser.isPresent()) {
            SystemUser u = sysUser.get();
            resp.put("role",  u.getRole().name());
            resp.put("name",  u.getFullName());
            resp.put("id",    u.getId());
            resp.put("email", u.getEmail());
            return resp;
        }

        // User
        var userOpt = userRepo.findByUsername(username);
        if (userOpt.isPresent()) {
            User u = userOpt.get();          // Fixed: was using undefined variable j
            resp.put("role",     "USER");
            resp.put("name",     u.getFullName());
            resp.put("id",       u.getId());
            resp.put("username", u.getUsername());
            resp.put("category", u.getCategory().name());
            return resp;
        }

        // Parent (login with phone number)
        var parent = parentRepo.findByPhone(username);
        if (parent.isPresent()) {
            Parent p = parent.get();
            resp.put("role",               "PARENT");
            resp.put("name",               p.getChildName());
            resp.put("id",                 p.getId());
            resp.put("phone",              p.getPhone());
            resp.put("category",           p.getCategory());
            resp.put("hasChangedPassword", p.isHasChangedPassword());
            resp.put("applicationId",      p.getApplicationId());
            return resp;
        }

        throw new RuntimeException("User not found after authentication");
    }
}