// ================================================================
//  FILE: src/main/java/lk/school/admission/service/AuthService.java
//  UPDATED: PARENT login response now includes all children and
//           their category slots grouped by child.
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.Parent;
import lk.school.admission.entity.ParentApplication;
import lk.school.admission.entity.ParentChild;
import lk.school.admission.entity.SystemUser;
import lk.school.admission.entity.User;
import lk.school.admission.repository.system.ParentApplicationRepository;
import lk.school.admission.repository.system.ParentChildRepository;
import lk.school.admission.repository.system.ParentRepository;
import lk.school.admission.repository.system.SystemUserRepository;
import lk.school.admission.repository.system.UserRepository;
import lk.school.admission.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired private AuthenticationManager       authManager;
    @Autowired private JwtUtils                    jwtUtils;
    @Autowired private SystemUserRepository        systemUserRepo;
    @Autowired private UserRepository              userRepo;
    @Autowired private ParentRepository            parentRepo;
    @Autowired private ParentChildRepository       parentChildRepo;
    @Autowired private ParentApplicationRepository parentAppRepo;

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

        // ── Admin / DC ────────────────────────────────────────────
        var sysUser = systemUserRepo.findByEmail(username);
        if (sysUser.isPresent()) {
            SystemUser u = sysUser.get();
            resp.put("role",  u.getRole().name());
            resp.put("name",  u.getFullName());
            resp.put("id",    u.getId());
            resp.put("email", u.getEmail());
            return resp;
        }

        // ── User (judge) ──────────────────────────────────────────
        var userOpt = userRepo.findByUsername(username);
        if (userOpt.isPresent()) {
            User u = userOpt.get();
            resp.put("role",     "USER");
            resp.put("name",     u.getFullName());
            resp.put("id",       u.getId());
            resp.put("username", u.getUsername());
            resp.put("category", u.getCategory().name());
            return resp;
        }

        // ── Parent (login with phone number) ──────────────────────
        var parentOpt = parentRepo.findByPhone(username);
        if (parentOpt.isPresent()) {
            Parent p = parentOpt.get();

            // Build children list with their slots
            List<ParentChild> children = parentChildRepo.findByParentId(p.getId());

            List<Map<String, Object>> childrenData = children.stream().map(child -> {
                List<ParentApplication> slots =
                    parentAppRepo.findByParentIdAndChildId(p.getId(), child.getId());

                List<Map<String, Object>> slotList = slots.stream().map(slot -> {
                    Map<String, Object> sm = new LinkedHashMap<>();
                    sm.put("slotId",        slot.getId());
                    sm.put("category",      slot.getCategory());
                    sm.put("hasSubmitted",  slot.getApplicationId() != null);
                    sm.put("applicationId", slot.getApplicationId());
                    return sm;
                }).collect(Collectors.toList());

                Map<String, Object> cm = new LinkedHashMap<>();
                cm.put("childId",   child.getId());
                cm.put("childName", child.getChildName());
                cm.put("slots",     slotList);
                return cm;
            }).collect(Collectors.toList());

            resp.put("role",               "PARENT");
            resp.put("id",                 p.getId());
            resp.put("phone",              p.getPhone());
            resp.put("hasChangedPassword", p.isHasChangedPassword());
            resp.put("children",           childrenData);
            return resp;
        }

        throw new RuntimeException("User not found after authentication");
    }
}