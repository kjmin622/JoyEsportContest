package com.joy.esports.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MaxScoreResponse {
    private Long status = 200L;

    private String message = "Success";

    private Long score;

    private LocalDateTime date;
}
