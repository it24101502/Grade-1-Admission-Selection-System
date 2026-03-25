// ================================================================
//  FILE: src/main/java/lk/school/admission/security/CustomUserDetailsService.java
//  UPDATED: ApplicantRepository → ParentRepository
//           "Applicant" references → "Parent"
// ================================================================
package lk.school.admission.security;

import lk.school.admission.entity.Judge;
import lk.school.admission.entity.Parent;
import lk.school.admission.entity.SystemUser;
import lk.school.admission.repository.JudgeRepository;
import lk.school.admission.repository.ParentRepository;
import lk.school.admission.repository.SystemUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired private ParentRepository     parentRepo;     // UPDATED
    @Autowired private JudgeRepository      judgeRepo;
    @Autowired private SystemUserRepository systemUserRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // ── Step 1: Check SystemUser table (Admin, Document Controller) ──
        var sysUser = systemUserRepo.findByEmail(username);
        if (sysUser.isPresent()) {
            SystemUser u = sysUser.get();
            return new User(
                u.getEmail(),
                u.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name()))
            );
        }

        // ── Step 2: Check Judge table ─────────────────────────────────────
        var judge = judgeRepo.findByUsername(username);
        if (judge.isPresent()) {
            Judge j = judge.get();
            return new User(
                j.getUsername(),
                j.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_JUDGE"))
            );
        }

        // ── Step 3: Check Parent table (UPDATED from Applicant) ──────────
        var parent = parentRepo.findByEmail(username);
        if (parent.isPresent()) {
            Parent p = parent.get();
            return new User(
                p.getEmail(),
                p.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_PARENT"))  // UPDATED
            );
        }

        throw new UsernameNotFoundException("No user found with username: " + username);
    }
}