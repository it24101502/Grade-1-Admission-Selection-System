// ================================================================
//  FILE: src/main/java/lk/school/admission/repository/JudgeRepository.java
// ================================================================
package lk.school.admission.repository;

import lk.school.admission.entity.ApplicationCategory;
import lk.school.admission.entity.Judge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JudgeRepository extends JpaRepository<Judge, Long> {

    // Find judge by login username
    Optional<Judge> findByUsername(String username);

    // Find the judge responsible for a specific category
    Optional<Judge> findByCategory(ApplicationCategory category);

    // Check if username is taken
    boolean existsByUsername(String username);
}