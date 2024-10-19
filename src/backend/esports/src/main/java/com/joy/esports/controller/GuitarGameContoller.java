package com.joy.esports.controller;


import com.joy.esports.dto.*;
import com.joy.esports.model.GuitarGameInfo;
import com.joy.esports.model.GuitarGameStatus;
import com.joy.esports.model.RacingGameInfo;
import com.joy.esports.model.UserAuth;
import com.joy.esports.repository.GuitarGameInfoRepository;
import com.joy.esports.repository.RacingGameInfoRepository;
import com.joy.esports.service.AuthService;
import com.joy.esports.service.GuitarGameService;
import com.joy.esports.service.RacingGameService;
import com.joy.esports.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/game/guitar")
public class GuitarGameContoller {

    private final AuthService authService;
    private final GuitarGameService guitarGameService;
    private final GuitarGameInfoRepository guitarGameRepository;
    private final JwtUtil jwtUtil;

    public GuitarGameContoller(AuthService authService, JwtUtil jwtUtil, GuitarGameService guitarGameService,
                               GuitarGameInfoRepository guitarGameRepository) {
        this.authService = authService;
        this.guitarGameService = guitarGameService;
        this.jwtUtil = jwtUtil;
        this.guitarGameRepository = guitarGameRepository;
    }

    @PostMapping("/get_score")
    public ResponseEntity<?> GetMaxScore(@RequestBody @Validated JWTRequest jwtRequest){
        // 토큰 검증
        if (!jwtUtil.isTokenValid(jwtRequest.getToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Expired Token");
        }
        GuitarGameInfo gameInfo = guitarGameService.GetMaxScoreInfo(authService.jwtToUserAuth(jwtRequest.getToken()));

        MaxScoreResponse res = new MaxScoreResponse();
        res.setScore(gameInfo.getMaxScore());
        res.setDate(gameInfo.getMaxDate());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/set_score")
    public ResponseEntity<?> SetMaxScore(@RequestBody @Validated ScoreRequest scoreRequest){
        // 토큰 검증
        if (!jwtUtil.isTokenValid(scoreRequest.getToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Expired Token");
        }
        UserAuth userAuth = authService.jwtToUserAuth(scoreRequest.getToken());
        GuitarGameInfo gameInfo = guitarGameService.GetMaxScoreInfo(userAuth);
        long before_score = gameInfo.getMaxScore();
        long now_score = scoreRequest.getScore();

        GameResultResponse res = new GameResultResponse();
        res.setNowScore(now_score);
        res.setMaxScore(before_score);

        if(before_score < now_score){
            guitarGameService.SetMaxScoreInfo(userAuth, now_score);
            res.setMaxScore(now_score);
        }


        return ResponseEntity.ok(res);
    }

    @PostMapping("/ranking")
    public ResponseEntity<?> GetRanking(@RequestBody @Validated JWTRequest jwtRequest){
        // 토큰 검증
        if (!jwtUtil.isTokenValid(jwtRequest.getToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Expired Token");
        }

        List<Object[]> rankingData = guitarGameRepository.findRanking();

        List<RankingResponse> rankingResponseList = rankingData.stream()
                .map(data -> {
                    RankingResponse response = new RankingResponse();
                    response.setName((String) data[0]);
                    response.setType((Long) data[1]);
                    response.setMaxScore((Long) data[2]);
                    response.setMaxDate((LocalDateTime) data[3]);
                    return response;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(rankingResponseList);
    }
}
