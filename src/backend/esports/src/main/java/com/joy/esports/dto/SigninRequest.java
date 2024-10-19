package com.joy.esports.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SigninRequest {
    @NotBlank
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank
    private String password;
}
