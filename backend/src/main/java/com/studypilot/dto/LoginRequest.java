package com.studypilot.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Login request DTO.
 *
 * Explicit getters/setters are used instead of Lombok to avoid relying on
 * annotation processing. This makes the DTO work consistently across IDEs
 * and build environments.
 */
public class LoginRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    public LoginRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}