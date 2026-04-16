// ================================================================
//  FILE: src/main/java/lk/school/admission/entity/Parent.java
//  UPDATED: Renamed from Applicant → Parent
//           Table name changed: applicants → parents
//
//  Represents a PARENT/GUARDIAN user account.
//  Created by the Document Controller.
//  Login: email = username, NIC = initial password.
// ================================================================
package lk.school.admission.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Parent login account created by the Document Controller.
 * Stored in admission_apps database (via AppsDataSourceConfig).
 *
 * Username = phone number
 * Password = NIC number (BCrypt hashed), parent changes on first login.
 */
@Entity
@Table(name = "parents")
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

    /** BCrypt(NIC) initially */
    @Column(nullable = false)
    private String passwordHash;

    /** Child's name entered by DC */
    @Column(nullable = false, length = 150)
    private String childName;

    /** CO, SIS, OG, TR, EDU, AB */
    @Column(nullable = false, length = 10)
    private String category;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean hasChangedPassword = false;

    /** Set once the parent submits their application form */
    private Long applicationId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}