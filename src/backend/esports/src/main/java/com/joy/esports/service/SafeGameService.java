package com.joy.esports.service;

import com.joy.esports.dto.PointRequest;
import com.joy.esports.dto.SafeGameInfoResponse;
import com.joy.esports.dto.TicketRequest;
import com.joy.esports.model.SafeGameInfo;
import com.joy.esports.model.SafeGameTicket;
import com.joy.esports.model.UserAuth;
import com.joy.esports.repository.SafeGameInfoRepository;
import com.joy.esports.repository.SafeGameTicketRepository;
import com.joy.esports.repository.UserAuthRepository;
import com.joy.esports.repository.UserInfoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.FileNotFoundException;
import java.time.LocalDateTime;

@Service
@Slf4j
public class SafeGameService {
    private final UserAuthRepository userAuthRepository;
    private final UserInfoRepository userInfoRepository;
    private final SafeGameInfoRepository gameInfoRepository;
    private final SafeGameTicketRepository gameTicketRepository;

    public SafeGameService(UserAuthRepository userAuthRepository, UserInfoRepository userInfoRepository,
                           SafeGameInfoRepository gameInfoRepository, SafeGameTicketRepository gameTicketRepository) {
        this.userAuthRepository = userAuthRepository;
        this.userInfoRepository = userInfoRepository;
        this.gameInfoRepository = gameInfoRepository;
        this.gameTicketRepository = gameTicketRepository;
    }

    public void makeGameInfo(UserAuth userAuth) {
        SafeGameInfo gameInfo = new SafeGameInfo();
        gameInfo.setUserAuth(userAuth);
        gameInfoRepository.save(gameInfo);
    }

    public void SubmitTicket(UserAuth userAuth, TicketRequest ticket){
        // 티켓이 충분히 있는지
        SafeGameInfo safeGameInfo = gameInfoRepository.findById(userAuth.getId())
                .orElseThrow(()->{throw new IllegalStateException("Not Found Table");});
        if(safeGameInfo.getTicketCount() == 0){
            throw new IllegalArgumentException("Not Exist Ticket");
        }
        safeGameInfo.setTicketCount(safeGameInfo.getTicketCount()-1);

        SafeGameTicket newTicket = new SafeGameTicket();
        newTicket.setNumber(ticket.getNumber());
        newTicket.setDate(LocalDateTime.now());
        newTicket.setUserAuth(userAuth);
        gameTicketRepository.save(newTicket);
        gameInfoRepository.save(safeGameInfo);
    }

    public void AddPoint(UserAuth userAuth, PointRequest point){
        // 증가한 포인트 연산
        SafeGameInfo safeGameInfo = gameInfoRepository.findById(userAuth.getId())
                .orElseThrow(()->{throw new IllegalStateException("Not Found Table");});
        Long now_point = safeGameInfo.getTicketPoint() + point.getPoint();


        // 티켓 요구량 확인 및 티켓 발급
        Long have_tickets = gameTicketRepository.countTickets(userAuth.getId()) + safeGameInfo.getTicketCount();
        Long request_point = have_tickets * 100;

        if(now_point >= request_point){
            safeGameInfo.setTicketCount(safeGameInfo.getTicketCount() + 1);
            now_point -= request_point;
        }
        safeGameInfo.setTicketPoint(now_point);

        gameInfoRepository.save(safeGameInfo);
    }

    public SafeGameInfoResponse GetTicketAndPoint(UserAuth userAuth){
        SafeGameInfo safeGameInfo = gameInfoRepository.findById(userAuth.getId())
                .orElseThrow(()->{throw new IllegalStateException("Not Found Table");});

        SafeGameInfoResponse res = new SafeGameInfoResponse();
        Long have_tickets = gameTicketRepository.countTickets(userAuth.getId()) + safeGameInfo.getTicketCount();
        res.setPoint(safeGameInfo.getTicketPoint());
        res.setTicketCount(safeGameInfo.getTicketCount());
        res.setNeedPoint(have_tickets * 100);
        return res;
    }
}
