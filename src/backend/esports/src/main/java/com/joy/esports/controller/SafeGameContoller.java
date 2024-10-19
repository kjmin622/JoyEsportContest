package com.joy.esports.controller;


import com.joy.esports.dto.*;
import com.joy.esports.model.RacingGameInfo;
import com.joy.esports.model.SafeGameInfo;
import com.joy.esports.model.UserAuth;
import com.joy.esports.repository.RacingGameInfoRepository;
import com.joy.esports.repository.SafeGameInfoRepository;
import com.joy.esports.repository.SafeGameTicketRepository;
import com.joy.esports.service.AuthService;
import com.joy.esports.service.RacingGameService;
import com.joy.esports.service.SafeGameService;
import com.joy.esports.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cglib.core.Local;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/game/safe")
public class SafeGameContoller {
    private final AuthService authService;
    private final SafeGameService safeGameService;
    private final SafeGameInfoRepository safeGameRepository;

    private final SafeGameTicketRepository safeGameTicketRepository;
    private final JwtUtil jwtUtil;

    public SafeGameContoller(AuthService authService, JwtUtil jwtUtil, SafeGameService safeGameService,
                             SafeGameInfoRepository safeGameRepository, SafeGameTicketRepository safeGameTicketRepository) {
        this.authService = authService;
        this.safeGameService = safeGameService;
        this.jwtUtil = jwtUtil;
        this.safeGameRepository = safeGameRepository;
        this.safeGameTicketRepository = safeGameTicketRepository;
    }

    @PostMapping("/get_tickets")
    public ResponseEntity<?> GetTickets(@RequestBody @Validated JWTRequest jwtRequest){
        // 토큰 검증
        if (!jwtUtil.isTokenValid(jwtRequest.getToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Expired Token");
        }
        List<Object[]> tickets = safeGameTicketRepository.findTickets(jwtUtil.extractUserEmail(jwtRequest.getToken()));
        List<TicketDTO> data = tickets.stream().map(d -> {
            TicketDTO dto = new TicketDTO();
            dto.setNumber((Long)d[0]);
            dto.setDate((LocalDateTime) d[1]);
            return dto;
        }).collect(Collectors.toList());

        DataResponse<List<TicketDTO>> res = new DataResponse<>();
        res.setData(data);

        return ResponseEntity.ok(res);
    }

    @PostMapping("/submit_tickets")
    public ResponseEntity<?> SubmitTicket(@RequestBody @Validated TicketRequest ticketRequest){
        // 토큰 검증
        try {
            if (!jwtUtil.isTokenValid(ticketRequest.getToken())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Expired Token");
            }

            safeGameService.SubmitTicket(authService.jwtToUserAuth(ticketRequest.getToken()), ticketRequest);
            return ResponseEntity.ok("");
        }catch(IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Not Exist Ticket");
        }
    }

    @PostMapping("/add_point")
    public ResponseEntity<?> AddPoint(@RequestBody @Validated PointRequest pointRequest){
        if (!jwtUtil.isTokenValid(pointRequest.getToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Expired Token");
        }
        safeGameService.AddPoint(authService.jwtToUserAuth(pointRequest.getToken()), pointRequest);
        return ResponseEntity.ok("");
    }

    @PostMapping("get_point")
    public ResponseEntity<?> GetTicketsAndPoint(@RequestBody @Validated JWTRequest jwtRequest){
        if (!jwtUtil.isTokenValid(jwtRequest.getToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Expired Token");
        }

        return ResponseEntity.ok(safeGameService.GetTicketAndPoint(authService.jwtToUserAuth(jwtRequest.getToken())));
    }
}
