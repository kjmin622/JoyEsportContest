package com.joy.esports.service;

import com.joy.esports.dto.SigninRequest;
import com.joy.esports.dto.SignupRequest;
import com.joy.esports.model.UserAuth;
import com.joy.esports.model.UserInfo;
import com.joy.esports.repository.UserAuthRepository;
import com.joy.esports.repository.UserInfoRepository;
import com.joy.esports.util.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.web.server.ResponseStatusException;

import java.io.FileNotFoundException;
import java.util.Optional;

@Service
@Slf4j
public class AuthService {

    private final UserAuthRepository userAuthRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserInfoRepository userInfoRepository;

    private final JwtUtil jwtUtil;


    public AuthService(UserAuthRepository userAuthRepository, UserInfoRepository userInfoRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userAuthRepository = userAuthRepository;
        this.userInfoRepository = userInfoRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public UserAuth registerUser(SignupRequest signupRequest) {
        try {
            UserAuth userAuth = new UserAuth();

            // 한양 메일인지 확인
            if (!(signupRequest.getEmail().contains("hanyang"))) {
                throw new IllegalArgumentException("Email must contain 'hanyang'");
            }

            userAuth.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
            userAuth.setEmail(signupRequest.getEmail());

            UserAuth res = userAuthRepository.save(userAuth);

            // 성공적으로 유저 Auth 생성했다면 이름과 학번 저장
            UserInfo userInfo = new UserInfo();
            try {
                userInfo.setName(signupRequest.getName());
                userInfo.setStudentId(signupRequest.getStudent_id());
                userInfo.setUserAuth(res);
                // 데이터베이스에 유저 저장
                userInfoRepository.save(userInfo);
            } catch(Exception e){
                userAuthRepository.delete(res);
                log.error(e.toString());
                throw new IllegalArgumentException(e.getMessage());
            }

            return res;

        } catch (IllegalArgumentException e){
            throw new IllegalArgumentException(e.getMessage());

        } catch (DataIntegrityViolationException e) {
            // 데이터 무결성 제약 위반 시 예외 처리 (예: 중복 이메일 등)
            throw new DataIntegrityViolationException("Email already exists or other data integrity violation: " + e.getMessage());

        } catch (TransactionSystemException e) {
            // 트랜잭션 문제 발생 시 예외 처리
            throw new TransactionSystemException("Transaction failed: " + e.getMessage());

        } catch (Exception e) {
            // 그 외 다른 예외 처리
            throw new RuntimeException("Failed to register user: " + e.getMessage());
        }
    }

    public String verifyUser(JwtUtil jwtUtil, String query){
        try {
            int length = Integer.parseInt(query.substring(0,4)) - 1000;
            String query_1 = query.substring(4,4+length);

            Long id = Long.parseLong(query.substring(4+length));

            Optional<UserAuth> userAuthOpt = userAuthRepository.findById(id);

            if (userAuthOpt.isPresent()) {

                UserAuth userAuth = userAuthOpt.get();

                String email = userAuth.getEmail();
                // 이미 인증되었을 경우 처리
                if(userAuth.getIsVerified()){
                    return jwtUtil.generateToken(email);
                }
                if (jwtUtil.isTokenValid(query_1, email + "joy")) {
                    userAuth.setIsVerified(true);
                    userAuthRepository.save(userAuth);
                } else {
                    userAuthRepository.delete(userAuth);
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "expired token");
                }
                return jwtUtil.generateToken(email);
            }
            throw new Exception("invalid link");
        }catch(ExpiredJwtException e){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "expired token");
        }catch(Exception e){
            throw new IllegalArgumentException("invalid link");
        }
    }

    public UserAuth signinUser(SigninRequest signinRequest){
        try {
            if(signinRequest.getEmail() == "" || signinRequest.getPassword() == ""){
                throw new ChangeSetPersister.NotFoundException();
            }
            log.info("1");
            UserAuth userAuth = userAuthRepository.findByEmail(signinRequest.getEmail())
                    .orElseThrow(() -> new ChangeSetPersister.NotFoundException());

            if(!passwordEncoder.matches(signinRequest.getPassword(), userAuth.getPassword())){
                throw new RuntimeException("Invalid Password");
            }

            if(userAuth.getIsVerified() == false){
                throw new FileNotFoundException("Not Verified Email");
            }
            return userAuth;

        }catch(ChangeSetPersister.NotFoundException e){
            throw new IllegalArgumentException("Not Found Email");
        }catch(RuntimeException e) {
            throw new IllegalArgumentException("InValid password");
        }catch(FileNotFoundException e){
            throw new RuntimeException("Not Verified Email");
        }
    }

    public UserAuth jwtToUserAuth(String token){
        try {
            UserAuth userAuth = userAuthRepository.findByEmail(jwtUtil.extractUserEmail(token))
                    .orElseThrow(() -> new Exception());
            return userAuth;
        }catch(Exception e){
            return null;
        }
    }

    public UserInfo getUserInfo(UserAuth userAuth){
        return userInfoRepository.findById(userAuth.getId())
                .orElseThrow(()->new IllegalArgumentException());
    }
}
