package lk.school.admission.repository.system;

import lk.school.admission.entity.system.ApplicationCategory;
import lk.school.admission.entity.system.MarkingScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarkingSchemeRepository extends JpaRepository<MarkingScheme, Long> {

    /** Find the currently active scheme for a judge category */
    Optional<MarkingScheme> findByCategoryAndActiveTrue(ApplicationCategory category);

    /** All schemes for a category (active + historical) */
    List<MarkingScheme> findByCategoryOrderByCreatedAtDesc(ApplicationCategory category);

    /** All active schemes across all categories */
    List<MarkingScheme> findByActiveTrue();

    /** Eager-load criteria to avoid N+1 when rendering the judge's form */
    @Query("SELECT s FROM MarkingScheme s LEFT JOIN FETCH s.criteria c " +
           "WHERE s.category = :cat AND s.active = true ORDER BY c.displayOrder ASC")
    Optional<MarkingScheme> findActiveSchemeByCategoryWithCriteria(
            @Param("cat") ApplicationCategory cat);
}