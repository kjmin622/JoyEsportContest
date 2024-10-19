package com.joy.esports.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketDTO {
    Long number;
    LocalDateTime date;
}
