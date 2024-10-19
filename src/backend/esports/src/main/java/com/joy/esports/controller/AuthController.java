package com.joy.esports.controller;

import com.joy.esports.dto.JWTRequest;
import com.joy.esports.dto.SigninRequest;
import com.joy.esports.dto.SignupRequest;
import com.joy.esports.dto.UserResponse;
import com.joy.esports.model.UserAuth;
import com.joy.esports.model.UserInfo;
import com.joy.esports.repository.UserAuthRepository;
import com.joy.esports.service.AuthService;
import com.joy.esports.service.GuitarGameService;
import com.joy.esports.service.RacingGameService;
import com.joy.esports.service.SafeGameService;
import com.joy.esports.util.JwtUtil;
import com.joy.esports.util.MailUtil;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    private final GuitarGameService guitarGameService;
    private final RacingGameService racingGameService;
    private final SafeGameService safeGameService;
    private final JwtUtil jwtUtil;

    private final MailUtil mailUtil;

    private final UserAuthRepository userAuthRepository;

    public AuthController(AuthService authService, JwtUtil jwtUtil, MailUtil mailUtil,
                          GuitarGameService guitarGameService, RacingGameService racingGameService, SafeGameService safeGameService,
                          UserAuthRepository userAuthRepository) {
        this.authService = authService;
        this.guitarGameService = guitarGameService;
        this.racingGameService = racingGameService;
        this.safeGameService = safeGameService;
        this.jwtUtil = jwtUtil;
        this.mailUtil = mailUtil;
        this.userAuthRepository = userAuthRepository;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody @Validated SignupRequest signupRequest) {
        try {
            // 유저 등록 서비스 호출
            UserAuth userAuth = authService.registerUser(signupRequest);
            // 토큰 생성
            String token = jwtUtil.generateToken(userAuth.getEmail());

            // 메일 전송
            mailUtil.emailCertiSend(signupRequest.getEmail(), jwtUtil.generateToken(userAuth.getEmail() + "joy"), userAuth.getId());

            // 기본 테이블 생성
            guitarGameService.MakeGameInfo(userAuth);
            racingGameService.MakeGameInfo(userAuth);
            safeGameService.makeGameInfo(userAuth);


            return ResponseEntity.ok("");

        } catch (DataIntegrityViolationException e) {
            // 409 - 이미 존재하는 메일
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists or data integrity violation");

        } catch (IllegalArgumentException e){
            // 400 - 올바르지 않은 메일
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("The email is incorrect or is not a Hanyang email");
        } catch (TransactionSystemException e) {
            // 500 - 트랜잭션 실패 예외 처리
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Transaction failed");
        }catch (RuntimeException e){
            // 500 - 메일 전송 실패 처리
            log.error(e.getMessage(), e.getCause());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Mail failed");
        } catch (Exception e) {
            // 500 - 그 외 일반적인 예외 처리
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to register user");
        }
    }

    @GetMapping("/certification")
    public ResponseEntity<?> emailCertification(@RequestParam String query) {
        try {
            String token = authService.verifyUser(jwtUtil, query);
            return ResponseEntity.ok(token);
        }
        catch (IllegalArgumentException e) {
            // 400
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("링크가 잘못되었습니다.");
        }
        catch (ResponseStatusException e) {
            // 401
            Long id = Long.parseLong(query.substring(4+query.length()));
            userAuthRepository.deleteById(id);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 만료되었습니다. 재가입해주세요");
        }
        catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("에러가 발생했습니다. 다시 시도해주세요");
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> loginUser(@RequestBody @Validated SigninRequest signinRequest) {
        try {
            // 로그인 서비스 호출
            UserAuth userAuth = authService.signinUser(signinRequest);
            // 토큰 생성
            String token = jwtUtil.generateToken(userAuth.getEmail());

            return ResponseEntity.ok(token);
        } catch (IllegalArgumentException e) {
            // 404 - 유저가 없음
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("NOT Found User");
        }catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not Verified Email");
        } catch (Exception e) {
            // 500 - 그 외 일반적인 예외 처리
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("internet error");
        }
    }


    @PostMapping("/valid")
    public ResponseEntity<?> validToken(@RequestBody @Validated JWTRequest jwtRequest){
        log.info(jwtRequest.getToken());
        if(jwtUtil.isTokenValid(jwtRequest.getToken())){
            return ResponseEntity.ok(true);
        }
        else{
            return ResponseEntity.ok(false);
        }
    }

    @PostMapping("/user")
    public ResponseEntity<?> getUserInfo(@RequestBody @Validated JWTRequest jwtRequest){
        try {
            // 토큰 검증
            if (!jwtUtil.isTokenValid(jwtRequest.getToken())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Expired Token");
            }
            UserAuth userAuth = authService.jwtToUserAuth(jwtRequest.getToken());
            UserInfo userInfo = authService.getUserInfo(userAuth);

            UserResponse res = new UserResponse();
            res.setName(userInfo.getName());
            res.setEmail(userAuth.getEmail());
            res.setStudent_id(userInfo.getStudentId());

            return ResponseEntity.ok(res);
        }catch(IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Expired Token");
        }
    }
}
