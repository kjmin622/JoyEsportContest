package com.joy.esports.dto;

import lombok.Data;

@Data
public class UserResponse{
    private Long status = 200L;
    private String message = "Success";
    private String name;
    private String email;
    private String student_id;
}
