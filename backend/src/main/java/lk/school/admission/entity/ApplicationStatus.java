// ================================================================
//  FILE: src/main/java/lk/school/admission/entity/ApplicationStatus.java
//  Tracks the current state of each application.
// ================================================================
package lk.school.admission.entity;

public enum ApplicationStatus {
    FORM_PENDING,    // Login created, form not yet filled
    SUBMITTED,       // Parent has filled and submitted the form
    UNDER_REVIEW,    // Judge is reviewing
    SCORED,          // Judge has entered marks
    FLAGGED,         // Judge flagged for attention
    SELECTED,        // Selected for admission
    REJECTED         // Not selected
}