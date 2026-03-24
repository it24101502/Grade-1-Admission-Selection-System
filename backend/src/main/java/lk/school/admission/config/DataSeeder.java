// ================================================================
//  FILE: src/main/java/lk/school/admission/config/DataSeeder.java
//  UPDATED: Role.APPLICANT → Role.PARENT in console messages
//  (The seeder itself doesn't create parent accounts —
//   that's done by the Document Controller at runtime.)
// ================================================================
package lk.school.admission.config;

import lk.school.admission.entity.*;
import lk.school.admission.repository.JudgeRepository;
import lk.school.admission.repository.SystemUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private SystemUserRepository systemUserRepo;
    @Autowired private JudgeRepository      judgeRepo;
    @Autowired private PasswordEncoder      passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedDocumentController();
        seedJudges();
        printSeedSummary();
    }

    // ── Create Admin Account ──────────────────────────────────────
    private void seedAdmin() {
        if (!systemUserRepo.existsByEmail("admin@school.lk")) {
            SystemUser admin = SystemUser.builder()
                    .fullName("System Administrator")
                    .email("admin@school.lk")
                    .passwordHash(passwordEncoder.encode("Admin@2025"))
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build();
            systemUserRepo.save(admin);
        }
    }

    // ── Create Document Controller Account ───────────────────────
    private void seedDocumentController() {
        if (!systemUserRepo.existsByEmail("dc@school.lk")) {
            SystemUser dc = SystemUser.builder()
                    .fullName("Document Controller")
                    .email("dc@school.lk")
                    .passwordHash(passwordEncoder.encode("DocCtrl@2025"))
                    .role(Role.DOCUMENT_CONTROLLER)
                    .isActive(true)
                    .build();
            systemUserRepo.save(dc);
        }
    }

    // ── Create 6 Judge Accounts ───────────────────────────────────
    private void seedJudges() {
        createJudge("Judge CO",  "judge_co",  "Judge_CO@2025",  ApplicationCategory.CO);
        createJudge("Judge SIS", "judge_sis", "Judge_SIS@2025", ApplicationCategory.SIS);
        createJudge("Judge OG",  "judge_og",  "Judge_OG@2025",  ApplicationCategory.OG);
        createJudge("Judge ED",  "judge_ed",  "Judge_ED@2025",  ApplicationCategory.ED);
        createJudge("Judge TR",  "judge_tr",  "Judge_TR@2025",  ApplicationCategory.TR);
        createJudge("Judge AB",  "judge_ab",  "Judge_AB@2025",  ApplicationCategory.AB);
    }

    private void createJudge(String name, String username,
                              String password, ApplicationCategory category) {
        if (!judgeRepo.existsByUsername(username)) {
            Judge judge = Judge.builder()
                    .fullName(name)
                    .username(username)
                    .passwordHash(passwordEncoder.encode(password))
                    .category(category)
                    .role(Role.JUDGE)
                    .isActive(true)
                    .forcePasswordReset(false)
                    .build();
            judgeRepo.save(judge);
        }
    }

    private void printSeedSummary() {
        System.out.println("\n╔══════════════════════════════════════════════╗");
        System.out.println("║          DEFAULT ACCOUNTS READY              ║");
        System.out.println("╠══════════════════════════════════════════════╣");
        System.out.println("║ ADMIN:  admin@school.lk  / Admin@2025        ║");
        System.out.println("║ DC:     dc@school.lk     / DocCtrl@2025      ║");
        System.out.println("╠══════════════════════════════════════════════╣");
        System.out.println("║ JUDGES:                                       ║");
        System.out.println("║  judge_co  / Judge_CO@2025   → CO            ║");
        System.out.println("║  judge_sis / Judge_SIS@2025  → SIS           ║");
        System.out.println("║  judge_og  / Judge_OG@2025   → OG            ║");
        System.out.println("║  judge_ed  / Judge_ED@2025   → ED            ║");
        System.out.println("║  judge_tr  / Judge_TR@2025   → TR            ║");
        System.out.println("║  judge_ab  / Judge_AB@2025   → AB            ║");
        System.out.println("╠══════════════════════════════════════════════╣");
        System.out.println("║ PARENTS: Created by Document Controller      ║");
        System.out.println("║  Username = Parent Email                     ║");
        System.out.println("║  Password = Parent NIC (initial)             ║");
        System.out.println("╚══════════════════════════════════════════════╝\n");
    }
}