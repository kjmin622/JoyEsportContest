package com.joy.esports.controller;


import com.joy.esports.dto.*;
import com.joy.esports.model.RacingGameInfo;
import com.joy.esports.model.UserAuth;
import com.joy.esports.repository.RacingGameInfoRepository;
import com.joy.esports.service.AuthService;
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
@RequestMapping("/api/game/racing")
public class RacingGameContoller {
    private final AuthService authService;
    private final RacingGameService racingGameService;
    private final RacingGameInfoRepository racingGameRepository;
    private final JwtUtil jwtUtil;

    public RacingGameContoller(AuthService authService, JwtUtil jwtUtil, RacingGameService racingGameService,
                               RacingGameInfoRepository racingGameRepository) {
        this.authService = authService;
        this.racingGameService = racingGameService;
        this.jwtUtil = jwtUtil;
        this.racingGameRepository = racingGameRepository;
    }

    @PostMapping("/get_score")
    public ResponseEntity<?> GetMaxScore(@RequestBody @Validated JWTRequest jwtRequest){
        // 토큰 검증
        if (!jwtUtil.isTokenValid(jwtRequest.getToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Expired Token");
        }
        RacingGameInfo gameInfo = racingGameService.GetMaxScoreInfo(authService.jwtToUserAuth(jwtRequest.getToken()));

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
        RacingGameInfo gameInfo = racingGameService.GetMaxScoreInfo(userAuth);
        long before_score = gameInfo.getMaxScore();
        long now_score = scoreRequest.getScore();

        GameResultResponse res = new GameResultResponse();
        res.setNowScore(now_score);
        res.setMaxScore(before_score);
        if(before_score < now_score){
            racingGameService.SetMaxScoreInfo(userAuth, now_score);
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

        List<Object[]> rankingData = racingGameRepository.findRanking();

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
