package lk.school.admission.repository.system;

import lk.school.admission.entity.MarkingCriterion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MarkingCriterionRepository extends JpaRepository<MarkingCriterion, Long> {
    List<MarkingCriterion> findBySchemeIdOrderByDisplayOrderAsc(Long schemeId);
}