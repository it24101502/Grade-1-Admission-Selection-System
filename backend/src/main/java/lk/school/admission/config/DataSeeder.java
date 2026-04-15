// ================================================================
//  FILE: src/main/java/lk/school/admission/config/DataSeeder.java
//  On each startup: upserts Admin, DC, all Judges, and demo parent; re-encodes
//  their passwords so DB rows always match the landing-page default credentials.
// ================================================================
package lk.school.admission.config;

import lk.school.admission.entity.*;
import lk.school.admission.repository.CategorySlotRepository;
import lk.school.admission.repository.JudgeRepository;
import lk.school.admission.repository.ParentRepository;
import lk.school.admission.repository.SystemUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private SystemUserRepository   systemUserRepo;
    @Autowired private JudgeRepository        judgeRepo;
    @Autowired private ParentRepository       parentRepo;
    @Autowired private CategorySlotRepository slotRepo;
    @Autowired private PasswordEncoder        passwordEncoder;

    /** Demo parent — must match LandingPage / AuthContext DEFAULT_CREDENTIALS.PARENT */
    private static final String DEMO_PARENT_EMAIL    = "test@parent.lk";
    private static final String DEMO_PARENT_NIC      = "199012345678";
    private static final String DEMO_PARENT_FULLNAME = "Demo Parent (Seeded)";

    @Override
    public void run(String... args) {
        // Always re-encode passwords for known seed accounts so a bad/old DB row cannot
        // block login (previously we only inserted when missing — wrong hashes never fixed).
        upsertSystemUser(
                "admin@school.lk",
                "System Administrator",
                "Admin@2025",
                Role.ADMIN);
        upsertSystemUser(
                "dc@school.lk",
                "Document Controller",
                "DocCtrl@2025",
                Role.DOCUMENT_CONTROLLER);
        upsertJudge("Judge CO",  "judge_co",  "Judge_CO@2025",  ApplicationCategory.CO);
        upsertJudge("Judge SIS", "judge_sis", "Judge_SIS@2025", ApplicationCategory.SIS);
        upsertJudge("Judge OG",  "judge_og",  "Judge_OG@2025",  ApplicationCategory.OG);
        upsertJudge("Judge ED",  "judge_ed",  "Judge_ED@2025",  ApplicationCategory.ED);
        upsertJudge("Judge TR",  "judge_tr",  "Judge_TR@2025", ApplicationCategory.TR);
        upsertJudge("Judge AB",  "judge_ab",  "Judge_AB@2025", ApplicationCategory.AB);
        seedDemoParent();
        printSeedSummary();
    }

    private void upsertSystemUser(String email, String fullName, String plainPassword, Role role) {
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

    private void upsertJudge(
            String displayName,
            String username,
            String plainPassword,
            ApplicationCategory category) {
        Judge judge = judgeRepo.findByUsername(username).orElseGet(() -> {
            Judge j = new Judge();
            j.setUsername(username);
            j.setRole(Role.JUDGE);
            return j;
        });
        judge.setFullName(displayName);
        judge.setPasswordHash(passwordEncoder.encode(plainPassword));
        judge.setCategory(category);
        judge.setActive(true);
        judge.setForcePasswordReset(false);
        judgeRepo.save(judge);
    }

    /**
     * One demo parent so "Parent Portal" on the landing page can log in without using the DC first.
     * Password = NIC (same rule as Document Controller–created accounts).
     * If the row already exists, password is reset to the demo NIC so login always matches the UI.
     */
    private void seedDemoParent() {
        Parent saved;
        Optional<Parent> existing = parentRepo.findByEmail(DEMO_PARENT_EMAIL);
        if (existing.isPresent()) {
            Parent p = existing.get();
            p.setPasswordHash(passwordEncoder.encode(DEMO_PARENT_NIC));
            p.setNic(DEMO_PARENT_NIC);
            p.setActive(true);
            p.setHasChangedPassword(false);
            saved = parentRepo.save(p);
        } else {
            Parent parent = Parent.builder()
                    .fullName(DEMO_PARENT_FULLNAME)
                    .email(DEMO_PARENT_EMAIL)
                    .nic(DEMO_PARENT_NIC)
                    .passwordHash(passwordEncoder.encode(DEMO_PARENT_NIC))
                    .role(Role.PARENT)
                    .isActive(true)
                    .hasChangedPassword(false)
                    .build();
            saved = parentRepo.save(parent);
        }
        if (!slotRepo.existsByParentIdAndCategory(saved.getId(), ApplicationCategory.CO)) {
            slotRepo.save(CategorySlot.builder()
                    .parent(saved)
                    .category(ApplicationCategory.CO)
                    .displayLabel("Chief Occupant")
                    .build());
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
        System.out.println("║ DEMO PARENT (Landing \"Parent Portal\"):       ║");
        System.out.println("║  " + DEMO_PARENT_EMAIL + " / " + DEMO_PARENT_NIC + "           ║");
        System.out.println("╠══════════════════════════════════════════════╣");
        System.out.println("║ OTHER PARENTS: Created by Document Controller║");
        System.out.println("║  Username = Parent Email                     ║");
        System.out.println("║  Password = Parent NIC (initial)             ║");
        System.out.println("╚══════════════════════════════════════════════╝\n");
    }
}