// ================================================================
//  FILE: src/main/java/lk/school/admission/entity/SystemUser.java
//
//  Represents ADMIN and DOCUMENT CONTROLLER accounts.
//  These are staff members created by the Admin.
//  (Applicants and Judges have their own tables.)
// ================================================================
package lk.school.admission.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * ADMIN and DOCUMENT_CONTROLLER staff accounts.
 * Stored in admission_system database.
 */
@Entity
@Table(name = "system_users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SystemUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}