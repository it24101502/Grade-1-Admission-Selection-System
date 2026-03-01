package com.grade1.admission.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.grade1.admission.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
