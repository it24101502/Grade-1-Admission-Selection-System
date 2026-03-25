// ================================================================
//  FILE: src/main/java/lk/school/admission/entity/Application.java
//  UPDATED: Added visitComment and flagReason fields for Step 5/6
// ================================================================
package lk.school.admission.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 20)
    private String applicationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = false)
    private Parent parent;

    // Field 1
    @Column(nullable = false, length = 150)
    private String applicantNameEnglish;
    @Column(nullable = false, length = 150)
    private String applicantNameSinhala;
    @Column(nullable = false, length = 20)
    private String applicantRelationship;

    // Field 2
    @Column(nullable = false, length = 20)
    private String contactNumber;

    // Field 3
    @Column(nullable = false, length = 200)
    private String addressLine1;
    @Column(length = 200)
    private String addressLine2;
    @Column(length = 200)
    private String addressLine3;
    @Column(nullable = false, length = 100)
    private String town;
    @Column(nullable = false, length = 100)
    private String street;
    @Column(nullable = false, length = 100)
    private String district;

    // Field 4
    @Column(nullable = false, length = 20)
    private String phoneNumber;

    // Field 5
    @Column(nullable = false, length = 20)
    private String applicantNic;

    // Field 6
    @Column(nullable = false, columnDefinition = "TEXT")
    private String locationLink;
    @Column(precision = 8)
    private Double distanceFromSchoolKm;
    private Double homeLat;
    private Double homeLon;

    // Field 7
    @Column(nullable = false, length = 150)
    private String childNameEnglish;

    // Field 8
    @Column(nullable = false, length = 150)
    private String childNameSinhala;

    // Field 9
    @Column(nullable = false, length = 50)
    private String birthCertNumber;
    @Column(nullable = false, length = 100)
    private String birthCertDivision;
    @Column(nullable = false, length = 100)
    private String birthCertDistrict;
    @Column(nullable = false)
    private LocalDate dateOfBirth;

    // Field 10 - Mother (optional)
    @Column(length = 150) private String motherFullName;
    @Column(length = 20)  private String motherContact;
    @Column(length = 20)  private String motherIdNumber;
    @Column(length = 100) private String motherOccupation;
    @Column(length = 200) private String motherPlaceOfWork;
    @Column(length = 150) private String motherEmail;

    // Field 11 - Father (optional)
    @Column(length = 150) private String fatherFullName;
    @Column(length = 20)  private String fatherContact;
    @Column(length = 20)  private String fatherIdNumber;
    @Column(length = 100) private String fatherOccupation;
    @Column(length = 200) private String fatherPlaceOfWork;
    @Column(length = 150) private String fatherEmail;

    // Field 12
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationCategory category;

    // System fields
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.FORM_PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_judge_id")
    private Judge assignedJudge;

    private Double  totalMarks;
    private Integer rankInCategory;

    // ── NEW FIELDS for Step 5 & 6 ─────────────────────────────
    // Judge's comment after reviewing/visiting (Step 5)
    @Column(columnDefinition = "TEXT")
    private String visitComment;

    // Flag reason set by judge (Step 6)
    private boolean isFlagged = false;

    @Column(length = 500)
    private String flagReason;

    // Timestamps
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = ApplicationStatus.FORM_PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public ApplicationCategory getCategory() {
        return category;
    }

    public void setCategory(ApplicationCategory category) {
        this.category = category;
    }

    public ApplicationStatus getStatus() {
        return status;
    }
    
    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public Judge getAssignedJudge() {
        return assignedJudge;
    }
    
    public void setAssignedJudge(Judge assignedJudge) {
        this.assignedJudge = assignedJudge;
    }

    public Double getTotalMarks() {
        return totalMarks;
    }
    
    
    public void setTotalMarks(Double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public Integer getRankInCategory() {
        return rankInCategory;
    }
    
    
    public void setRankInCategory(Integer rankInCategory) {
        this.rankInCategory = rankInCategory;
    }

    public String getVisitComment() {
        return visitComment;
    }
    
    
    public void setVisitComment(String visitComment) {
        this.visitComment = visitComment;
    }

    public boolean isFlagged() {
        return isFlagged;
    }
    
    
    public void setFlagged(boolean isFlagged) {
        this.isFlagged = isFlagged;
    }

    public String getFlagReason() {
        return flagReason;
    }
    
    
    public void setFlagReason(String flagReason) {
        this.flagReason = flagReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
    
    
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getApplicationNumber() {
    return applicationNumber;
}

    public void setApplicationNumber(String applicationNumber) {
        this.applicationNumber = applicationNumber;
    }

    public Parent getParent() {
        return parent;
    }
    
    public void setParent(Parent parent) {
        this.parent = parent;
    }
}