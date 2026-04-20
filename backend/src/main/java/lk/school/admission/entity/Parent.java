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

@Entity
@Table(name = "parents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data

public class Parent{

    // ── Primary Key ──────────────────────────────────────────────
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Login Credentials (set by Document Controller) ───────────
    // Email is the username for login
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    // Password stored as BCrypt hash (never plain text)
    // Initially set to BCrypt(NIC number) by Document Controller
    @Column(nullable = false)
    private String passwordHash;

    // ── Parent Basic Info ─────────────────────────────────────────
    @Column(nullable = false, length = 150)
    private String fullName;

    // NIC stored for reference (also used as initial password)
    @Column(nullable = false, unique = true, length = 20)
    private String nic;

    // ── Role ──────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.PARENT;

    // ── Account State ─────────────────────────────────────────────
    @Column(nullable = false)
    private boolean isActive = true;

    // Has the parent changed their password from the default (NIC)?
    @Column(nullable = false)
    private boolean hasChangedPassword = false;

    // ── Timestamps ────────────────────────────────────────────────
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ── Lifecycle ─────────────────────────────────────────────────
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.role == null) this.role = Role.PARENT;
    }

    public String getFullName() {
    return fullName;
}

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public Long getId() {
    return id;
}

    public void setId(Long id) {
        this.id = id;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }

    public boolean hasChangedPassword() {
        return hasChangedPassword;
    }
    
    public void setHasChangedPassword(boolean hasChangedPassword) {
        this.hasChangedPassword = hasChangedPassword;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }
}