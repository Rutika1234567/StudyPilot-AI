package com.studypilot.controller;

import com.studypilot.dto.ApiResponse;
import com.studypilot.dto.AuthResponse;
import com.studypilot.dto.LoginRequest;
import com.studypilot.dto.RegisterRequest;
import com.studypilot.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Register and login endpoints")
public class AuthController {

    @Autowired
    private AuthService authService;

    // POST /api/auth/register
    // Body: { "username": "john", "email": "john@email.com", "password": "secret123", "fullName": "John Doe" }
    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    // POST /api/auth/login
    // Body: { "username": "john", "password": "secret123" }
    // Returns: { "token": "eyJ...", "username": "john", ... }
    @PostMapping("/login")
    @Operation(summary = "Login and get JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}