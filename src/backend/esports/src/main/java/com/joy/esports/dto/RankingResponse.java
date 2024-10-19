package com.joy.esports.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RankingResponse {
    private String name;
    private Long type;
    private Long maxScore;
    private LocalDateTime maxDate;
}
