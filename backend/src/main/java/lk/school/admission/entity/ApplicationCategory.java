// ================================================================
//  FILE: src/main/java/lk/school/admission/entity/ApplicationCategory.java
//  These are the 6 judge categories. Each application is sorted
//  into one of these, and routed to the matching judge.
// ================================================================

package lk.school.admission.entity;

/**
 * The six application categories. Each user is responsible for exactly one.
 * EDU replaces the old "ED" to avoid confusion with "Education".
 */
public enum ApplicationCategory {
    CO,   // Chief Occupant
    SIS,  // Siblings
    OG,   // Old Girls / Old Boys
    TR,   // Transfer
    EDU,  // Educational
    AB    // Abroad / Other
}