package com.joy.esports.util;

import com.joy.esports.model.UserAuth;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final long ACCESS_TOKEN_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 20; // 20일
    private Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256); // 더 강력한 키 생성

    // 공통적으로 토큰 생성 로직
    private String createToken(String username, long expirationTime) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(key)
                .compact();
    }

    // JWT Access Token 생성
    public String generateToken(String email) {
        return createToken(email, ACCESS_TOKEN_EXPIRATION_TIME);
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .setSigningKey(key)
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUserEmail(String token) {
        return extractClaims(token).getSubject();
    }
    public boolean isTokenValid(String token) {
        String username = extractUserEmail(token);
        return username.equals(extractUserEmail(token)) && !isTokenExpired(token);
    }
    public boolean isTokenValid(String token, String username) {
        return username.equals(extractUserEmail(token)) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        try {
            return extractClaims(token).getExpiration().before(new Date());
        }catch(Exception e){
            return false;
        }
    }
}
