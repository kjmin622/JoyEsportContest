package com.joy.esports.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_info")
public class UserInfo {

    @Id
    private Long id; // 외래키를 그대로 사용하기 때문에 @GeneratedValue를 사용하지 않음

    @Column(nullable = false, length = 10)
    private String name;

    @Column(nullable = false, length = 11)
    private String studentId;

    // user_auth 테이블과의 관계를 맺는 외래키 설정
    @OneToOne
    @MapsId // UserAuth의 id를 외래키로 사용
    @JoinColumn(name = "id") // 외래 키 이름 지정
    private UserAuth userAuth;
}
