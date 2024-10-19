package com.joy.esports.repository;

import com.joy.esports.dto.RankingResponse;
import com.joy.esports.model.GuitarGameInfo;
import com.joy.esports.model.RacingGameInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RacingGameInfoRepository extends JpaRepository<RacingGameInfo, Long> {
    Optional<RacingGameInfo> findById(Long id);

    @Query("SELECT ui.name, ua.type, rg.maxScore, rg.maxDate " +
            "FROM RacingGameInfo rg " +
            "JOIN rg.userAuth ua " +
            "JOIN UserInfo ui ON ui.id = ua.id " +
            "WHERE ua.isVerified = true " +
            "ORDER BY rg.maxScore DESC, rg.maxDate ASC")
    List<Object[]> findRanking();
}
