// ================================================================
//  FILE: src/main/java/lk/school/admission/entity/Judge.java
//
//  Represents a Judge user. There is one judge per category.
//  Created by the Admin. Judges can only see applications
//  in their assigned category.
// ================================================================
package lk.school.admission.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * One judge per application category (CO, SIS, OG, TR, EDU, AB).
 * Auto-seeded by DataSeeder on startup.
 * Stored in admission_system database.
 */
@Entity
@Table(name = "judges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Judge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, unique = true, length = 80)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private ApplicationCategory category;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.JUDGE;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.role == null) this.role = Role.JUDGE;
    }
}