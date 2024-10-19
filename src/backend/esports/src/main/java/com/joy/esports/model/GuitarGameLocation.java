package com.joy.esports.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "guitar_game_location")
public class GuitarGameLocation {

    @Id
    private Long id; // 외래 키이자 기본 키로 설정 (user_auth의 id 참조)

    @Column(nullable = false)
    private Long level;

    @Column(nullable = false)
    private Float x;

    @Column(nullable = false)
    private Float y;

    // user_auth 테이블과의 1:1 또는 N:1 관계 설정
    @ManyToOne
    @JoinColumn(name = "id", nullable = false, insertable = false, updatable = false) // id는 외래 키로 사용
    private UserAuth userAuth;
}
