// ================================================================
//  FILE: src/main/java/lk/school/admission/entity/Application.java
//  UPDATED: Added visitComment and flagReason fields for Step 5/6
// ================================================================
package lk.school.admission.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Application form submitted by a parent.
 * Stored in admission_apps database.
 *
 * ARCHITECTURE NOTE (Option 2):
 * Raw form data lives here.
 * System processing data (scores, flags, rankings) also lives here
 * BUT is owned/written by the system layer (judges/admin), NOT by parents.
 * The judge reference is stored as a plain Long (cross-DB by ID) to avoid
 * a JPA foreign-key across two separate datasources.
 */
@Entity
@Table(name = "applications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** e.g. CO-0001 */
    @Column(unique = true, length = 20)
    private String applicationNumber;

    /** FK to Parent in the same (apps) DB */
    @Column(nullable = false)
    private Long parentId;

    // ── Category & Status ─────────────────────────────────────
    /** CO, SIS, OG, TR, EDU, AB */
    @Column(nullable = false, length = 10)
    private String category;

    /** PENDING | SUBMITTED | UNDER_REVIEW | SCORED | SELECTED | REJECTED */
    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "PENDING";

    // ── Judge assignment (cross-DB: stored as Long, not @ManyToOne) ──
    /** ID of the Judge in admission_system who is assigned to this application */
    private Long assignedJudgeId;

    // ── System scoring fields (written by judge/admin) ────────
    /** Sum of all numeric criterion scores entered by the judge */
    private Double totalScore;

    private Integer rankInCategory;

    /** GREEN | YELLOW | RED | null (null means no flag) */
    @Column(length = 10)
    private String flagColor;

    @Column(length = 500)
    private String flagReason;

    /** Set by the judge via the marking form */
    @Column(columnDefinition = "TEXT")
    private String judgeComment;

    // ── Applicant info ────────────────────────────────────────
    @Column(length = 150) private String applicantNameEnglish;
    @Column(length = 150) private String applicantNameSinhala;
    @Column(length = 30)  private String applicantRelationship;
    @Column(length = 20)  private String applicantNic;
    @Column(length = 20)  private String contactNumber;
    @Column(length = 20)  private String phoneNumber;

    // ── Address ───────────────────────────────────────────────
    @Column(length = 200) private String addressLine1;
    @Column(length = 200) private String addressLine2;
    @Column(length = 100) private String town;
    @Column(length = 100) private String street;
    @Column(length = 100) private String district;

    // ── Location / Distance ───────────────────────────────────
    @Column(columnDefinition = "TEXT")
    private String locationLink;
    private Double distanceFromSchoolKm;
    private Double homeLat;
    private Double homeLon;

    // ── Child ─────────────────────────────────────────────────
    @Column(length = 150) private String childNameEnglish;
    @Column(length = 150) private String childNameSinhala;
    @Column(length = 50)  private String birthCertNumber;
    @Column(length = 100) private String birthCertDivision;
    @Column(length = 100) private String birthCertDistrict;
    private LocalDate dateOfBirth;

    // ── Mother (optional) ─────────────────────────────────────
    @Column(length = 150) private String motherFullName;
    @Column(length = 20)  private String motherContact;
    @Column(length = 20)  private String motherNic;
    @Column(length = 100) private String motherOccupation;
    @Column(length = 200) private String motherWorkplace;
    @Column(length = 150) private String motherEmail;

    // ── Father (optional) ─────────────────────────────────────
    @Column(length = 150) private String fatherFullName;
    @Column(length = 20)  private String fatherContact;
    @Column(length = 20)  private String fatherNic;
    @Column(length = 100) private String fatherOccupation;
    @Column(length = 200) private String fatherWorkplace;
    @Column(length = 150) private String fatherEmail;

    // ── Timestamps ────────────────────────────────────────────
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /** Convenience — true if any flag colour is set */
    @Transient
    public boolean isFlagged() {
        return this.flagColor != null && !this.flagColor.isBlank();
    }
}