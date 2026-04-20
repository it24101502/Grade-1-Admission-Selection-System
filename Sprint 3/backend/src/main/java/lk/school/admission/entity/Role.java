// ================================================================
//  FILE: src/main/java/lk/school/admission/entity/Role.java
//  Defines the 4 types of users in the system.
// ================================================================
package lk.school.admission.entity;

public enum Role {
    PARENT,           // Parent who fills the form
    DOCUMENT_CONTROLLER, // Creates logins for applicants
    JUDGE,               // Reviews and marks applications
    ADMIN                // Full access — Principal
}