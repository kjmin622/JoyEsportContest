package com.joy.esports.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ScoreRequest {
    @NotBlank
    private String token;
    private Long score;
}
