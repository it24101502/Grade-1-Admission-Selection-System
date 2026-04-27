package lk.school.admission.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DC-designed marking template for ONE specific judge category.
 * Each judge has their own independent scheme.
 * Stored in admission_system database (via SystemDataSourceConfig).
 */
@Entity
@Table(name = "marking_schemes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MarkingScheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationCategory category;

    @Column(nullable = false, length = 200)
    private String title;

    /** Only one scheme per category should be active at a time */
    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(
        mappedBy     = "scheme",
        cascade      = CascadeType.ALL,
        orphanRemoval = true,
        fetch        = FetchType.LAZY
    )
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<MarkingCriterion> criteria = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /** Total possible numeric marks across all non-comment criteria */
    @Transient
    public double getTotalPossibleMarks() {
        return criteria.stream()
            .filter(c -> c.getFieldType() != MarkFieldType.COMMENT_ONLY)
            .mapToDouble(c -> c.getMaxScore() != null ? c.getMaxScore() : 0.0)
            .sum();
    }
}