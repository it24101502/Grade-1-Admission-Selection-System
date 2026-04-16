// ================================================================
//  FILE: src/main/java/lk/school/admission/repository/CategorySlotRepository.java
// ================================================================
package lk.school.admission.repository;

import lk.school.admission.entity.ApplicationCategory;
import lk.school.admission.entity.CategorySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategorySlotRepository extends JpaRepository<CategorySlot, Long> {

    // Get all slots for a parent (shown on parent dashboard)
    List<CategorySlot> findByParentId(Long parentId);

    // Check if a slot already exists for this parent + category
    boolean existsByParentIdAndCategory(Long parentId, ApplicationCategory category);

    // Get a specific slot
    Optional<CategorySlot> findByParentIdAndCategory(Long parentId, ApplicationCategory category);
}