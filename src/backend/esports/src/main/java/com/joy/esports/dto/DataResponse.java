package com.joy.esports.dto;

import lombok.Data;

@Data
public class DataResponse<T> {
    private Long status = 200L;
    private String message = "Success";
    T data;
}
