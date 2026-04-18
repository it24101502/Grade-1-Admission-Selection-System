// ================================================================
//  FILE: src/main/java/lk/school/admission/repository/ApplicationRepository.java
//  UPDATED: findByApplicantId → findByParentId
// ================================================================
// ================================================================
//  FILE: src/main/java/lk/school/admission/repository/ApplicationRepository.java
// ================================================================
package lk.school.admission.repository.apps;

import lk.school.admission.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByCategory(String category);

    List<Application> findByStatus(String status);

    List<Application> findByCategoryAndStatus(String category, String status);

    Optional<Application> findByApplicationNumber(String applicationNumber);

    List<Application> findByParentId(Long parentId);

    long countByCategory(String category);

    // Fixed: was findByAssignedJudgeId — field is now assignedUserId
    List<Application> findByAssignedUserId(Long userId);

    // Fixed: was findByCategoryAndAssignedJudgeId — field is now assignedUserId
    List<Application> findByCategoryAndAssignedUserId(String category, Long userId);

    /**
     * Ranked list for a category: scored apps first (totalScore DESC),
     * then by distance (ASC), excluding rejected.
     */
    @Query("SELECT a FROM Application a " +
           "WHERE a.category = :cat AND a.status != 'REJECTED' " +
           "ORDER BY COALESCE(a.totalScore, -1) DESC, " +
           "COALESCE(a.distanceFromSchoolKm, 99999) ASC")
    List<Application> findRankedByCategory(@Param("cat") String category);
}