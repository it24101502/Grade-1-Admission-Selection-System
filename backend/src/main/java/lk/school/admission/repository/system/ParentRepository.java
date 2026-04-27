// ================================================================
//  FILE: src/main/java/lk/school/admission/repository/apps/ParentRepository.java
//  UPDATED: Added findByPhoneAndNic for the DC conflict-check flow.
// ================================================================
package lk.school.admission.repository.system;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import lk.school.admission.entity.Parent;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Long> {

    Optional<Parent> findByPhone(String phone);

    Optional<Parent> findByNic(String nic);

    /** Used by DC to check if an exact phone+NIC pair already exists */
    Optional<Parent> findByPhoneAndNic(String phone, String nic);

    boolean existsByPhone(String phone);

    boolean existsByNic(String nic);
}