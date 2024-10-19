package com.joy.esports.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_auth")
public class UserAuth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false, length = 300)
    private String password;

    @Column(nullable = false)
    private Long type = 2L; // 기본값 2 설정

    @Column(nullable = false)
    private Boolean isVerified = false; // 기본값 false 설정
}
