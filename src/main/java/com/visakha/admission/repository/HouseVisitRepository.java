package com.visakha.admission.repository;

import com.visakha.admission.entity.HouseVisitComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HouseVisitRepository extends JpaRepository<HouseVisitComment, Long> {

    List<HouseVisitComment> findByApplicationId(Long applicationId);

}