// ================================================================
//  FILE: src/main/java/lk/school/admission/repository/apps/ParentApplicationRepository.java
//  UPDATED: All queries are now child-aware (parentId + childId).
// ================================================================
package lk.school.admission.repository.system;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import lk.school.admission.entity.ParentApplication;

@Repository
public interface ParentApplicationRepository extends JpaRepository<ParentApplication, Long> {

    /** All slots for this parent across all children */
    List<ParentApplication> findByParentId(Long parentId);

    /** All slots for a specific child of this parent */
    List<ParentApplication> findByParentIdAndChildId(Long parentId, Long childId);

    /** All slots across all children for a given category (useful for admin views) */
    List<ParentApplication> findByParentIdAndCategory(Long parentId, String category);

    /** Exact slot lookup: parent + child + category */
    Optional<ParentApplication> findByParentIdAndChildIdAndCategory(
            Long parentId, Long childId, String category);

    /** Check if this exact (parent, child, category) slot already exists */
    boolean existsByParentIdAndChildIdAndCategory(
            Long parentId, Long childId, String category);
}