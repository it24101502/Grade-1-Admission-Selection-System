package lk.school.admission.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * One marking criterion inside a MarkingScheme.
 * Stored in admission_system database.
 */
@Entity
@Table(name = "marking_criteria")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MarkingCriterion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scheme_id", nullable = false)
    private MarkingScheme scheme;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MarkFieldType fieldType;

    /** Null when fieldType = COMMENT_ONLY */
    private Double maxScore;

    /** Optional hint shown below the input */
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private int displayOrder = 0;
}