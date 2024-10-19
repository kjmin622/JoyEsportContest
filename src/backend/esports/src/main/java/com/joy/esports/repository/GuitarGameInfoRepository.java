package com.joy.esports.repository;

import com.joy.esports.model.GuitarGameInfo;
import com.joy.esports.model.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface GuitarGameInfoRepository extends JpaRepository<GuitarGameInfo, Long> {
    Optional<GuitarGameInfo> findById(Long id);

    @Query("SELECT ui.name, ua.type, rg.maxScore, rg.maxDate " +
            "FROM GuitarGameInfo rg " +
            "JOIN rg.userAuth ua " +
            "JOIN UserInfo ui ON ui.id = ua.id " +
            "WHERE ua.isVerified = true " +
            "ORDER BY rg.maxScore DESC, rg.maxDate ASC")
    List<Object[]> findRanking();
}
