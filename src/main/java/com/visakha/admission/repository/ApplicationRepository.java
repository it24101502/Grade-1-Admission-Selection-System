package com.visakha.admission.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.visakha.admission.entity.Application;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
}
