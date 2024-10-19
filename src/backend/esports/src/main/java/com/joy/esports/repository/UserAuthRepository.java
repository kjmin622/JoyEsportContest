package com.joy.esports.repository;

import com.joy.esports.model.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAuthRepository extends JpaRepository<UserAuth, Long> {
    Optional<UserAuth> findByEmail(String email);
    Optional<UserAuth> findById(Long id);
}
