package com.joy.esports.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RankingDTO {

    private String name;
    private Boolean isVerified;
    private int type;
    private int maxScore;
    private LocalDateTime maxDate;
}
