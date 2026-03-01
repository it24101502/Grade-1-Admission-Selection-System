package com.grade1.admission.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
