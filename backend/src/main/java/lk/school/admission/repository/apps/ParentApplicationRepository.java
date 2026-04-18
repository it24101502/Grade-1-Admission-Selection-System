package lk.school.admission.repository.apps;

import lk.school.admission.entity.ParentApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentApplicationRepository extends JpaRepository<ParentApplication, Long> {

    List<ParentApplication> findByParentId(Long parentId);

    Optional<ParentApplication> findByParentIdAndCategory(Long parentId, String category);

    boolean existsByParentIdAndCategory(Long parentId, String category);
}