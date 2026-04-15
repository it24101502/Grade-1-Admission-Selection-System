// ================================================================
//  FILE: src/main/java/lk/school/admission/repository/JudgeRepository.java
// ================================================================
package lk.school.admission.repository.system;

import lk.school.admission.entity.system.ApplicationCategory;
import lk.school.admission.entity.system.Judge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface JudgeRepository extends JpaRepository<Judge, Long> {
    Optional<Judge> findByUsername(String username);
    Optional<Judge> findByCategory(ApplicationCategory category);
    boolean existsByUsername(String username);
    boolean existsByCategory(ApplicationCategory category);
}