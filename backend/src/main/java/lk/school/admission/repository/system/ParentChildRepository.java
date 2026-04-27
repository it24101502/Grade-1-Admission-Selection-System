// ================================================================
//  FILE: src/main/java/lk/school/admission/repository/apps/ParentChildRepository.java
//  NEW: Repository for the parent_children table.
// ================================================================
package lk.school.admission.repository.system;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import lk.school.admission.entity.ParentChild;

@Repository
public interface ParentChildRepository extends JpaRepository<ParentChild, Long> {

    /** All children registered under this parent */
    List<ParentChild> findByParentId(Long parentId);

    /** Look up a specific child by name under this parent */
    Optional<ParentChild> findByParentIdAndChildName(Long parentId, String childName);

    /** Check if this child name is already registered under this parent */
    boolean existsByParentIdAndChildName(Long parentId, String childName);
}