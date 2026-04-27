// ================================================================
//  FILE: src/main/java/lk/school/admission/entity/ParentApplication.java
//  UPDATED: Added childId FK — one slot is now per (parent, child, category).
//
//  One row per (parent, child, category) combination.
//  A parent with 3 children, each with 3 categories → 9 rows here.
//
//  Example:
//    parentId=1, childId=1 (Liona), category=CO  → applicationId=null (not submitted)
//    parentId=1, childId=1 (Liona), category=SIS → applicationId=5   (submitted)
//    parentId=1, childId=2 (Milan), category=CO  → applicationId=null
// ================================================================
package lk.school.admission.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "parent_applications",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"parent_id", "child_id", "category"},
        name = "uk_parent_child_category"
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ParentApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK to Parent table */
    @Column(name = "parent_id", nullable = false)
    private Long parentId;

    /**
     * FK to ParentChild table.
     * Identifies which child this slot belongs to.
     */
    @Column(name = "child_id", nullable = false)
    private Long childId;

    /** CO, SIS, OG, TR, EDU, AB */
    @Column(nullable = false, length = 10)
    private String category;

    /**
     * Set once the parent submits the application form for this
     * (child, category) combination. Null means not yet submitted.
     */
    private Long applicationId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}