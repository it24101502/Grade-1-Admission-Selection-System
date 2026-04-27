// ================================================================
//  FILE: src/main/java/lk/school/admission/config/DataSeeder.java
//  On each startup: upserts Admin, DC, all Judges, and demo parent; re-encodes
//  their passwords so DB rows always match the landing-page default credentials.
// ================================================================
// ================================================================
//  FILE: src/main/java/lk/school/admission/config/DataSeeder.java
// ================================================================
package lk.school.admission.config;

import lk.school.admission.entity.*;
import lk.school.admission.repository.system.UserRepository;
import lk.school.admission.repository.system.SystemUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Runs on every startup.
 * Upserts Admin, Document Controller, and all 6 users so the system
 * is always usable with known credentials.
 * Passwords are re-encoded on every boot so a corrupted hash is auto-fixed.
 *
 * NOTE: No demo parent is seeded here.
 * Parents are created exclusively by the Document Controller via the DC dashboard.
 * (username = phone, password = NIC)
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private SystemUserRepository systemUserRepo;
    @Autowired private UserRepository       userRepo;
    @Autowired private PasswordEncoder      passwordEncoder;

    @Override
    public void run(String... args) {
        upsertSystemUser("System Administrator", "admin@school.lk", "Admin@2025",   Role.ADMIN);
        upsertSystemUser("Document Controller",  "dc@school.lk",    "DocCtrl@2025", Role.DOCUMENT_CONTROLLER);

        upsertUser("User CO",  "user_co",  "User_CO@2025",  ApplicationCategory.CO);
        upsertUser("User SIS", "user_sis", "User_SIS@2025", ApplicationCategory.SIS);
        upsertUser("User OG",  "user_og",  "User_OG@2025",  ApplicationCategory.OG);
        upsertUser("User TR",  "user_tr",  "User_TR@2025",  ApplicationCategory.TR);
        upsertUser("User EDU", "user_edu", "User_EDU@2025", ApplicationCategory.EDU);
        upsertUser("User AB",  "user_ab",  "User_AB@2025",  ApplicationCategory.AB);

        printSeedSummary();
    }

    // ─────────────────────────────────────────────────────────────

    private void upsertSystemUser(String fullName, String email,
                                   String plainPassword, Role role) {
        SystemUser user = systemUserRepo.findByEmail(email).orElseGet(() -> {
            SystemUser u = new SystemUser();
            u.setEmail(email);
            return u;
        });
        user.setFullName(fullName);
        user.setPasswordHash(passwordEncoder.encode(plainPassword));
        user.setRole(role);
        user.setActive(true);
        systemUserRepo.save(user);
    }

    private void upsertUser(String displayName, String username,
                             String plainPassword, ApplicationCategory category) {
        User user = userRepo.findByUsername(username).orElseGet(() -> {
            User u = new User();
            u.setUsername(username);   // Fixed: was j.setUsername / return j (j was undefined)
            return u;
        });
        user.setFullName(displayName);
        user.setPasswordHash(passwordEncoder.encode(plainPassword));
        user.setCategory(category);
        user.setRole(Role.USER);
        user.setActive(true);
        userRepo.save(user);
    }

    private void printSeedSummary() {
        System.out.println("\n╔══════════════════════════════════════════════════╗");
        System.out.println("║         DEFAULT ACCOUNTS SEEDED / VERIFIED      ║");
        System.out.println("╠══════════════════════════════════════════════════╣");
        System.out.println("║  ADMIN : admin@school.lk     / Admin@2025        ║");
        System.out.println("║  DC    : dc@school.lk        / DocCtrl@2025      ║");
        System.out.println("╠══════════════════════════════════════════════════╣");
        System.out.println("║  user_co  / User_CO@2025   → CO               ║");
        System.out.println("║  user_sis / User_SIS@2025  → SIS              ║");
        System.out.println("║  user_og  / User_OG@2025   → OG               ║");
        System.out.println("║  user_tr  / User_TR@2025   → TR               ║");
        System.out.println("║  user_edu / User_EDU@2025  → EDU              ║");
        System.out.println("║  user_ab  / User_AB@2025   → AB               ║");
        System.out.println("╠══════════════════════════════════════════════════╣");
        System.out.println("║  PARENTS: Created by DC only                    ║");
        System.out.println("║   Username = Phone Number                       ║");
        System.out.println("║   Password = NIC Number (initial)               ║");
        System.out.println("╚══════════════════════════════════════════════════╝\n");
    }
}