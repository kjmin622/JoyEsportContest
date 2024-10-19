package com.joy.esports.repository;

import com.joy.esports.model.RacingGameInfo;
import com.joy.esports.model.SafeGameInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SafeGameInfoRepository extends JpaRepository<SafeGameInfo, Long> {
    Optional<SafeGameInfo> findById(Long id);
}
