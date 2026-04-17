// ================================================================
//  FILE: src/main/java/lk/school/admission/repository/SystemUserRepository.java
// ================================================================
// ================================================================
//  FILE: repository/system/SystemUserRepository.java
// ================================================================
package lk.school.admission.repository.system;

import lk.school.admission.entity.system.Role;
import lk.school.admission.entity.system.SystemUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SystemUserRepository extends JpaRepository<SystemUser, Long> {
    Optional<SystemUser> findByEmail(String email);
    boolean existsByEmail(String email);
    List<SystemUser> findByRole(Role role);
}