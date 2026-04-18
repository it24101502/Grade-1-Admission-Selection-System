// ================================================================
//  FILE: src/main/java/lk/school/admission/entity/Role.java
//  Defines the 4 types of users in the system.
// ================================================================
package lk.school.admission.entity;

public enum Role {
    ADMIN,               // Full access — Principal
    DOCUMENT_CONTROLLER, // Creates logins for applicants
    USER                 // Reviews and marks applications
}