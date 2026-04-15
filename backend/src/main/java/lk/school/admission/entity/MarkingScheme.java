package lk.school.admission.entity.system;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A MarkingScheme is the DC-designed mark template for ONE specific judge (by category).
 * Each judge has their OWN scheme — schemes are not shared.
 *
 * A scheme contains multiple MarkingCriteria (the individual mark points).
 *
 * Example — CO judge scheme:
 *   1. "Distance from school"      → NUMBER_ONLY,        maxScore=30
 *   2. "Family connection"         → NUMBER_AND_COMMENT, maxScore=40
 *   3. "Interview observation"     → NUMBER_AND_COMMENT, maxScore=30
 *
 * Stored in admission_system database.
 */
@Entity
@Table(name = "marking_schemes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MarkingScheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Each scheme belongs to exactly one judge category.
     * Not unique at DB level — the DC can create a new version if needed.
     * Use active=true to find the live scheme for a category.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationCategory category;

    /** Human-readable title, e.g. "CO Category Marking Scheme 2025" */
    @Column(nullable = false, length = 200)
    private String title;

    /** Only one scheme per category should be active at a time */
    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** The individual mark points, ordered by displayOrder */
    @OneToMany(
        mappedBy    = "scheme",
        cascade     = CascadeType.ALL,
        orphanRemoval = true,
        fetch       = FetchType.LAZY
    )
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<MarkingCriterion> criteria = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /** Convenience: compute total possible marks from all NUMBER criteria */
    @Transient
    public Double getTotalPossibleMarks() {
        return criteria.stream()
            .filter(c -> c.getFieldType() != MarkFieldType.COMMENT_ONLY)
            .mapToDouble(c -> c.getMaxScore() != null ? c.getMaxScore() : 0)
            .sum();
    }
}