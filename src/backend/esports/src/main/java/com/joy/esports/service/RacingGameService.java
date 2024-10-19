package com.joy.esports.service;

import com.joy.esports.model.GuitarGameInfo;
import com.joy.esports.model.RacingGameInfo;
import com.joy.esports.model.UserAuth;
import com.joy.esports.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Slf4j
public class RacingGameService {
    private final UserAuthRepository userAuthRepository;
    private final UserInfoRepository userInfoRepository;
    private final RacingGameInfoRepository gameInfoRepository;

    public RacingGameService(UserAuthRepository userAuthRepository, UserInfoRepository userInfoRepository,
                             RacingGameInfoRepository gameInfoRepository) {
        this.userAuthRepository = userAuthRepository;
        this.userInfoRepository = userInfoRepository;
        this.gameInfoRepository = gameInfoRepository;
    }

    public void MakeGameInfo(UserAuth userAuth) {
        RacingGameInfo gameInfo = new RacingGameInfo();
        gameInfo.setUserAuth(userAuth);
        gameInfoRepository.save(gameInfo);
    }

    public RacingGameInfo GetMaxScoreInfo(UserAuth userAuth){
        RacingGameInfo info = gameInfoRepository.findById(userAuth.getId())
                .orElseThrow(()->new IllegalStateException("Invalid UserAuth"));

        return info;
    }

    public void SetMaxScoreInfo(UserAuth userAuth, Long score){
        RacingGameInfo info = gameInfoRepository.findById(userAuth.getId())
                .orElseThrow(()->new IllegalStateException("Invalid UserAuth"));
        info.setMaxScore(score);
        info.setMaxDate(LocalDateTime.now());
        gameInfoRepository.save(info);
    }
}
