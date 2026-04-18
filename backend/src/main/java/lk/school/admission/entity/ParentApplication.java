package lk.school.admission.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * One row per (parent, category) pair.
 * A parent can have multiple rows — one for each category the DC assigns.
 * Stored in admission_apps database.
 *
 * Example: same parent (phone=0777..., NIC=199...) can have:
 *   row 1 → category=CO, applicationId=null (not yet submitted)
 *   row 2 → category=SIS, applicationId=5   (submitted)
 */
@Entity
@Table(name = "parent_applications",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"parent_id", "category"},
        name = "uk_parent_category"
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ParentApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK to Parent table */
    @Column(nullable = false)
    private Long parentId;

    /** CO, SIS, OG, TR, EDU, AB */
    @Column(nullable = false, length = 10)
    private String category;

    /**
     * Set once the parent submits the application form for this category.
     * Null means not yet submitted.
     */
    private Long applicationId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}