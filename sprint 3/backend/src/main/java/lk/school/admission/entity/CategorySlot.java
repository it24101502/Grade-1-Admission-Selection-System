// ================================================================
//  FILE: src/main/java/lk/school/admission/entity/CategorySlot.java
//
//  A "CategorySlot" is created by the Document Controller for a
//  specific parent, allowing them to fill an application for that
//  category. One slot = one application form.
//
//  Example: DC creates slots [CO, SIS] for parent Priya Fernando.
//  Priya will see "Chief Occupant" and "Siblings" in her dashboard,
//  each with a "Fill Application" button.
// ================================================================
package lk.school.admission.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "category_slots",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"parent_id", "category"},
        name = "uk_parent_category"
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategorySlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which parent this slot belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = false)
    private Parent parent;

    // Which category they can apply for
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationCategory category;

    // The application filled for this slot (null until parent fills it)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private Application application;

    // Display label set by DC (e.g. "Chief Occupant", "Old Girl")
    @Column(length = 100)
    private String displayLabel;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        // Set default display labels if not provided
        if (this.displayLabel == null || this.displayLabel.isBlank()) {
            switch (this.category) {
                case CO:
                    this.displayLabel = "Chief Occupant";
                    break;
                case SIS:
                    this.displayLabel = "Sister Category";
                    break;
                case OG:
                    this.displayLabel = "Old Girl";
                    break;
                case ED:
                    this.displayLabel = "Educational";
                    break;
                case TR:
                    this.displayLabel = "Transfer";
                    break;
                case AB:
                    this.displayLabel = "Abroad / Other";
                    break;
                default:
                    this.displayLabel = "Unknown";
            }
        }
    }
}