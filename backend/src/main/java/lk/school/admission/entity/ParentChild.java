// ================================================================
//  FILE: src/main/java/lk/school/admission/entity/ParentChild.java
//  NEW: Represents one child belonging to a parent account.
//  A parent can have multiple children, each tracked here.
//  The DC registers a child by name under a parent (phone+NIC).
// ================================================================
package lk.school.admission.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * One row per (parent, child) pair.
 * A parent with 3 children → 3 rows here.
 *
 * Example:
 *   parentId=1, childName="Liona Perera"
 *   parentId=1, childName="Milan Perera"
 *   parentId=1, childName="Nadia Perera"
 */
@Entity
@Table(name = "parent_children",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"parent_id", "child_name"},
        name = "uk_parent_child_name"
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ParentChild {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK to Parent table */
    @Column(name = "parent_id", nullable = false)
    private Long parentId;

    /** Child's full name as entered by the DC */
    @Column(name = "child_name", nullable = false, length = 150)
    private String childName;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}