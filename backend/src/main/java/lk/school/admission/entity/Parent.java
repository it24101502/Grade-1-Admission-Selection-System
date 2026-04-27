// ================================================================
//  FILE: src/main/java/lk/school/admission/entity/Parent.java
//  UPDATED: Removed childName — children are now tracked in
//           the ParentChild table (one row per child).
//
//  Represents a PARENT/GUARDIAN user account.
//  Created by the Document Controller.
//  Login: phone number = username, NIC = initial password.
//  One parent account can have multiple children, and each child
//  can have multiple category slots.
// ================================================================
package lk.school.admission.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "parents",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"phone", "nic"},
        name = "uk_parent_phone_nic"
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Parent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Login username */
    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    /** Stored for reference; also the initial password */
    @Column(nullable = false, unique = true, length = 20)
    private String nic;

    /** BCrypt(NIC) initially; parent changes on first login */
    @Column(nullable = false)
    private String passwordHash;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean hasChangedPassword = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}