// ================================================================
//  FILE: src/main/java/lk/school/admission/repository/ParentRepository.java
//  UPDATED: Renamed from ApplicantRepository → ParentRepository
//           Uses Parent entity instead of Applicant
// ================================================================
package lk.school.admission.repository;

import lk.school.admission.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Long> {

    // Find parent by email (used for login)
    Optional<Parent> findByEmail(String email);

    // Check if an email is already registered
    boolean existsByEmail(String email);

    // Check if a NIC is already registered
    boolean existsByNic(String nic);
}