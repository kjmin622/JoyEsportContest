package com.joy.esports.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PointRequest {
    @NotBlank
    private String token;

    private Long point;
}
