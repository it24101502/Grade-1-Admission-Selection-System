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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "judges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data

public class Judge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Full name of the judge
    @Column(nullable = false, length = 150)
    private String fullName;

    // Username used for login
    @Column(nullable = false, unique = true, length = 80)
    private String username;

    // BCrypt hashed password
    @Column(nullable = false)
    private String passwordHash;

    // The category this judge is responsible for (one per judge)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private ApplicationCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.JUDGE;

    // Password management
    private LocalDate lastPasswordChange;
    private boolean forcePasswordReset = false;
    private boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.role == null) this.role = Role.JUDGE;
        if (this.lastPasswordChange == null) this.lastPasswordChange = LocalDate.now();
    }

    public String getFullName() {
    return fullName;
}

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }
    
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
}