package com.joy.esports.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JWTRequest {
    @NotBlank
    private String token;
}
