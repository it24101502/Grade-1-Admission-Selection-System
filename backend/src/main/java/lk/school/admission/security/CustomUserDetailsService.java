// ================================================================
//  FILE: src/main/java/lk/school/admission/security/CustomUserDetailsService.java
//  UPDATED: ApplicantRepository → ParentRepository
//           "Applicant" references → "Parent"
// ================================================================
// ================================================================
//  FILE: src/main/java/lk/school/admission/security/CustomUserDetailsService.java
// ================================================================
package lk.school.admission.security;

import lk.school.admission.entity.Parent;
import lk.school.admission.entity.User;
import lk.school.admission.entity.SystemUser;
import lk.school.admission.repository.system.ParentRepository;
import lk.school.admission.repository.system.UserRepository;
import lk.school.admission.repository.system.SystemUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Looks up users across both databases:
 *  1. SystemUser  (Admin / DC)  — login key = email
 *  2. User                      — login key = username (e.g. user_co)
 *  3. Parent                    — login key = phone number
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired private SystemUserRepository systemUserRepo;
    @Autowired private UserRepository       userRepo;
    @Autowired private ParentRepository     parentRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // 1. Admin / DC — identified by email
        var sysUser = systemUserRepo.findByEmail(username);
        if (sysUser.isPresent()) {
            SystemUser u = sysUser.get();
            // Fixed: use Spring Security's org.springframework.security.core.userdetails.User
            // not lk.school.admission.entity.User
            return new org.springframework.security.core.userdetails.User(
                u.getEmail(),
                u.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name())));
        }

        // 2. User — identified by username
        var userOpt = userRepo.findByUsername(username);
        if (userOpt.isPresent()) {
            User u = userOpt.get();   // Fixed: was using undefined variable j
            return new org.springframework.security.core.userdetails.User(
                u.getUsername(),
                u.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        }

        // 3. Parent — identified by phone number
        var parent = parentRepo.findByPhone(username);
        if (parent.isPresent()) {
            Parent p = parent.get();
            if (!p.isActive())
                throw new UsernameNotFoundException("Account is deactivated: " + username);
            return new org.springframework.security.core.userdetails.User(
                p.getPhone(),
                p.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_PARENT")));
        }

        throw new UsernameNotFoundException("No user found: " + username);
    }
}