package com.grade1.admission.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import com.grade1.admission.entity.*;
import com.grade1.admission.repository.UserRepository;
import com.grade1.admission.dto.*;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // REGISTER
    public String register(RegisterRequest request) {

        if (request.getRole() == Role.PARENT) {
            throw new RuntimeException("Parents cannot self-register");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        userRepository.save(user);

        return "User registered successfully";
    }

    // LOGIN
    public LoginResponse login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return new LoginResponse(
                user.getEmail(),
                user.getRole(),
                "Login successful"
        );
    }
}
