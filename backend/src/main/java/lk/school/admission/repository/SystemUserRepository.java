// ================================================================
//  FILE: src/main/java/lk/school/admission/repository/SystemUserRepository.java
// ================================================================
package lk.school.admission.repository;

import lk.school.admission.entity.Role;
import lk.school.admission.entity.SystemUser;
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