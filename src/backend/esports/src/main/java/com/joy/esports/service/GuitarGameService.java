package com.joy.esports.service;

import com.joy.esports.model.GuitarGameInfo;
import com.joy.esports.model.GuitarGameStatus;
import com.joy.esports.model.RacingGameInfo;
import com.joy.esports.model.UserAuth;
import com.joy.esports.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
public class GuitarGameService {
    private final UserAuthRepository userAuthRepository;
    private final UserInfoRepository userInfoRepository;
    private final GuitarGameInfoRepository gameInfoRepository;
    private final GuitarGameStatusRepository gameStatusRepository;

    public GuitarGameService(UserAuthRepository userAuthRepository, UserInfoRepository userInfoRepository,
                             GuitarGameInfoRepository gameInfoRepository, GuitarGameStatusRepository statusRepository) {
        this.userAuthRepository = userAuthRepository;
        this.userInfoRepository = userInfoRepository;
        this.gameInfoRepository = gameInfoRepository;
        this.gameStatusRepository = statusRepository;
    }

    public void MakeGameInfo(UserAuth userAuth){
        GuitarGameInfo gameInfo = new GuitarGameInfo();
        gameInfo.setUserAuth(userAuth);
        gameInfoRepository.save(gameInfo);

        GuitarGameStatus gameStatus = new GuitarGameStatus();
        gameStatus.setUserAuth(userAuth);
        gameStatusRepository.save(gameStatus);
    }

    public GuitarGameInfo GetMaxScoreInfo(UserAuth userAuth){
        GuitarGameInfo info = gameInfoRepository.findById(userAuth.getId())
                .orElseThrow(()->new IllegalStateException("Invalid UserAuth"));

        return info;
    }

    public void SetMaxScoreInfo(UserAuth userAuth, Long score){
        GuitarGameInfo info = gameInfoRepository.findById(userAuth.getId())
                .orElseThrow(()->new IllegalStateException("Invalid UserAuth"));
        info.setMaxScore(score);
        info.setMaxDate(LocalDateTime.now());
        gameInfoRepository.save(info);
    }

    public GuitarGameStatus getNowScoreAndGuitar(UserAuth userAuth){
        GuitarGameStatus status = gameStatusRepository.findById(userAuth.getId())
                .orElseThrow(()->new IllegalStateException("Invalid UserAuth"));

        return status;
    }

}
