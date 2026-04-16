package com.app.controller;

import com.app.security.enums.Role;
import com.app.security.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtService jwtService;

    @PostMapping("/token")
    public Map<String, String> generateToken(@RequestBody Map<String, Object> body) {
        String username = (String) body.get("username");

        @SuppressWarnings("unchecked")
        List<String> roleStrings = (List<String>) body.get("roles");

        List<Role> roles = roleStrings.stream()
                .map(Role::valueOf)
                .collect(Collectors.toList());

        String token = jwtService.generateToken(username, roles);
        return Map.of("token", token);
    }
}