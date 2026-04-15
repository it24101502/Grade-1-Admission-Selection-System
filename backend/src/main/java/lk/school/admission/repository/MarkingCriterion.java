package lk.school.admission.repository.system;

import lk.school.admission.entity.system.MarkingCriterion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MarkingCriterionRepository extends JpaRepository<MarkingCriterion, Long> {
    List<MarkingCriterion> findBySchemeIdOrderByDisplayOrderAsc(Long schemeId);
    void deleteBySchemeId(Long schemeId);
}