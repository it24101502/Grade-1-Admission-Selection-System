// ================================================================
//  FILE: src/main/java/lk/school/admission/entity/ApplicationCategory.java
//  These are the 6 judge categories. Each application is sorted
//  into one of these, and routed to the matching judge.
// ================================================================
package lk.school.admission.entity;

public enum ApplicationCategory {
    CO,   // Category CO
    SIS,  // Siblings
    OG,   // Old Girls / Old Boys
    ED,   // Educational
    TR,   // Transfer
    AB    // Other/Abroad
}