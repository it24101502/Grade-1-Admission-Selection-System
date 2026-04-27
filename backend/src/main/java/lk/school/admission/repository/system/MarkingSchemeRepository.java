package lk.school.admission.repository.system;

import lk.school.admission.entity.ApplicationCategory;
import lk.school.admission.entity.MarkingScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarkingSchemeRepository extends JpaRepository<MarkingScheme, Long> {

    Optional<MarkingScheme> findByCategoryAndActiveTrue(ApplicationCategory category);

    List<MarkingScheme> findByCategoryOrderByCreatedAtDesc(ApplicationCategory category);

    List<MarkingScheme> findByActiveTrue();

    @Query("SELECT s FROM MarkingScheme s LEFT JOIN FETCH s.criteria c " +
           "WHERE s.category = :cat AND s.active = true ORDER BY c.displayOrder ASC")
    Optional<MarkingScheme> findActiveSchemeByCategoryWithCriteria(
            @Param("cat") ApplicationCategory cat);
}