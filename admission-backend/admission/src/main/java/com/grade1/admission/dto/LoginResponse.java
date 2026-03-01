package com.grade1.admission.dto;

import com.grade1.admission.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String email;
    private Role role;
    private String message;

}
