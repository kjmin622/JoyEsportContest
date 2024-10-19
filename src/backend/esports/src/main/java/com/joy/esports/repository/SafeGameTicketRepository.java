package com.joy.esports.repository;

import com.joy.esports.dto.TicketDTO;
import com.joy.esports.model.SafeGameInfo;
import com.joy.esports.model.SafeGameTicket;
import com.joy.esports.model.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SafeGameTicketRepository extends JpaRepository<SafeGameTicket, Long> {
    Optional<SafeGameTicket> findById(Long id);

    @Query("SELECT rg.number, rg.date " +
            "FROM SafeGameTicket rg " +
            "JOIN rg.userAuth au " +
            "WHERE au.email=:email")
    List<Object[]> findTickets(@Param("email") String email);

    @Query("SELECT COUNT(st.number) " +
            "FROM SafeGameTicket st " +
            "JOIN st.userAuth ua " +
            "WHERE ua.id = :id")
    Long countTickets(@Param("id") Long id);
}
