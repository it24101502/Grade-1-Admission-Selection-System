// ================================================================
//  FILE: src/main/java/lk/school/admission/service/DocumentControllerService.java
//  UPDATED:
//    - ApplicantRepository → ParentRepository
//    - Applicant entity → Parent entity
//    - Role.APPLICANT → Role.PARENT
//    - All "applicant" variable names → "parent"
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.*;
import lk.school.admission.repository.ApplicationRepository;
import lk.school.admission.repository.ParentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DocumentControllerService {

    @Autowired private ParentRepository      parentRepo;         // UPDATED
    @Autowired private ApplicationRepository applicationRepo;
    @Autowired private PasswordEncoder       passwordEncoder;

    // ── STEP 2: Create Parent Login ────────────────────────────────
    // Called by Document Controller when a physical form is received
    public Map<String, Object> createParentLogin(             // UPDATED method name
            String fullName,
            String email,
            String nic) {

        // Validation: Check for duplicates
        if (parentRepo.existsByEmail(email)) {
            throw new RuntimeException("An account with this email already exists: " + email);
        }
        if (parentRepo.existsByNic(nic)) {
            throw new RuntimeException("An account with this NIC already exists: " + nic);
        }

        // Create the parent account
        // Password = NIC number (parent must change after first login)
        Parent parent = Parent.builder()                          // UPDATED
                .fullName(fullName)
                .email(email)
                .nic(nic)
                .passwordHash(passwordEncoder.encode(nic))        // NIC = initial password
                .role(Role.PARENT)                                // UPDATED
                .isActive(true)
                .hasChangedPassword(false)
                .build();

        Parent saved = parentRepo.save(parent);

        Map<String, Object> result = new HashMap<>();
        result.put("id",       saved.getId());
        result.put("fullName", saved.getFullName());
        result.put("email",    saved.getEmail());
        result.put("nic",      saved.getNic());
        result.put("message",
            "Login created. Send the parent this link: " +
            "http://localhost:3000/login?role=parent");           // UPDATED
        return result;
    }

    // ── Get all parents created by this DC ────────────────────────
    public List<Map<String, Object>> getAllParents() {            // UPDATED method name
        return parentRepo.findAll().stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id",        p.getId());
            m.put("fullName",  p.getFullName());
            m.put("email",     p.getEmail());
            m.put("nic",       p.getNic());
            m.put("createdAt", p.getCreatedAt().toString());
            m.put("isActive",  p.isActive());
            // Check if the parent has filled the form
            var apps = applicationRepo.findByParentId(p.getId()); // UPDATED
            m.put("formFilled",  !apps.isEmpty());
            m.put("formStatus",  apps.isEmpty()
                    ? "NOT_STARTED" : apps.get(0).getStatus().name());
            return m;
        }).toList();
    }

    // ── Reset password back to NIC ────────────────────────────────
    public void resetParentPassword(Long parentId) {              // UPDATED method name
        Parent parent = parentRepo.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        parent.setPasswordHash(passwordEncoder.encode(parent.getNic()));
        parent.setHasChangedPassword(false);
        parentRepo.save(parent);
    }

    // ── Toggle active/inactive ────────────────────────────────────
    public void toggleParentActive(Long parentId, boolean active) { // UPDATED method name
        Parent parent = parentRepo.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        parent.setActive(active);
        parentRepo.save(parent);
    }
}