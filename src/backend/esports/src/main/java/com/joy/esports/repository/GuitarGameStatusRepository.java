package com.joy.esports.repository;

import com.joy.esports.model.GuitarGameInfo;
import com.joy.esports.model.GuitarGameStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GuitarGameStatusRepository extends JpaRepository<GuitarGameStatus, Long> {
    Optional<GuitarGameStatus> findById(Long id);
}
