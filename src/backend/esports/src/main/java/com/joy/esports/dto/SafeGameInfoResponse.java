package com.joy.esports.dto;

import lombok.Data;

@Data
public class SafeGameInfoResponse {
    private Long status = 200L;
    private String message = "Success";
    private Long ticketCount;
    private Long point;
    private Long needPoint;
}
