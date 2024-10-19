package com.joy.esports.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "safe_game")
public class SafeGameInfo {

    @Id
    private Long id; // 외래 키로 사용되므로 @GeneratedValue 사용하지 않음

    @Column(nullable = false)
    private Long ticketCount = 1L; // 기본값 1 설정

    @Column(nullable = false)
    private Long ticketPoint = 0L; // 기본값 0 설정

    // user_auth 테이블과의 관계 설정
    @OneToOne
    @MapsId // 외래 키로 id를 사용하기 위해 @MapsId 사용
    @JoinColumn(name = "id", nullable = false)  // 외래 키로 id 사용
    private UserAuth userAuth;
}
