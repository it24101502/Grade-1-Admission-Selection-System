package lk.school.admission.entity;

/**
 * Determines what input the user sees for each marking criterion.
 *   NUMBER_ONLY         → numeric score input only
 *   COMMENT_ONLY        → free-text comment input only
 *   NUMBER_AND_COMMENT  → both a score and a comment field
 */
public enum MarkFieldType {
    NUMBER_ONLY,
    COMMENT_ONLY,
    NUMBER_AND_COMMENT
}
