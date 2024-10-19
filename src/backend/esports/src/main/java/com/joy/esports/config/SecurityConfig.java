package com.joy.esports.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // 모든 요청에 대해 인증을 요구하지 않도록 설정
        http
                .csrf().disable() // CSRF 보호 비활성화 (개발 중일 때만 비활성화, 나중에 필요 시 활성화)
                .authorizeHttpRequests((requests) -> requests
                        .anyRequest().permitAll() // 모든 경로 접근 허용
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // BCryptPasswordEncoder 사용
    }
}
