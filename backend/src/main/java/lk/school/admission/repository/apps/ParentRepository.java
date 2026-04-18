// ================================================================
//  FILE: src/main/java/lk/school/admission/repository/ParentRepository.java
//  UPDATED: Renamed from ApplicantRepository → ParentRepository
//           Uses Parent entity instead of Applicant
// ================================================================
package lk.school.admission.repository.apps;

import lk.school.admission.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Long> {
    Optional<Parent> findByPhone(String phone);
    boolean existsByPhone(String phone);
    boolean existsByNic(String nic);
}