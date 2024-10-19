package com.joy.esports.dto;

import lombok.Data;

@Data
public class GameResultResponse {
    private Long status = 200L;
    private String message = "Success";
    private Long nowScore;
    private Long maxScore;
}
