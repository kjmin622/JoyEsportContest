package com.joy.esports.repository;

import com.joy.esports.model.UserAuth;
import com.joy.esports.model.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserInfoRepository extends JpaRepository<UserInfo, Long> {
    UserInfo findByName(String name);
    Optional<UserInfo> findById(Long id);
}
