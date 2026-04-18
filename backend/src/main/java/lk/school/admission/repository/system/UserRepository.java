// ================================================================
//  FILE: src/main/java/lk/school/admission/repository/JudgeRepository.java
// ================================================================
// ── UserRepository.java ─────────────────────────────────────
package lk.school.admission.repository.system;

import lk.school.admission.entity.ApplicationCategory;
import lk.school.admission.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByCategory(ApplicationCategory category);
    boolean existsByUsername(String username);
}