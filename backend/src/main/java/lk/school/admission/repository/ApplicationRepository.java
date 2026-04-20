// ================================================================
//  FILE: src/main/java/lk/school/admission/repository/ApplicationRepository.java
//  UPDATED: findByApplicantId → findByParentId
// ================================================================
package lk.school.admission.repository;

import lk.school.admission.entity.Application;
import lk.school.admission.entity.ApplicationCategory;
import lk.school.admission.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // UPDATED: was findByApplicantId, now findByParentId
    List<Application> findByParentId(Long parentId);

    List<Application> findByCategory(ApplicationCategory category);

    List<Application> findByCategoryAndAssignedJudgeId(
            ApplicationCategory category, Long judgeId);

    List<Application> findByStatus(ApplicationStatus status);

    Optional<Application> findByApplicationNumber(String applicationNumber);

    long countByCategory(ApplicationCategory category);

    @Query("""
        SELECT a FROM Application a
        WHERE a.category = :category
        AND a.status NOT IN ('REJECTED')
        ORDER BY COALESCE(a.totalMarks, 0) DESC, a.distanceFromSchoolKm ASC
    """)
    List<Application> findRankedByCategory(@Param("category") ApplicationCategory category);
}