package com.joy.esports.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "safe_game_ticket")
public class SafeGameTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long key; // 기본 키로 설정

    @Column(nullable = false)
    private Long number;

    @Column(nullable = false)
    private LocalDateTime date;

    // user_auth 테이블과의 1:N 관계 설정
    @ManyToOne
    @JoinColumn(name = "id", nullable = false) // 외래 키로 id 사용
    private UserAuth userAuth;
}
