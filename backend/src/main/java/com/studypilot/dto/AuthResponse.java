package com.studypilot.dto;

import java.util.List;

/**
 * Authentication response returned after successful login or registration.
 *
 * Explicit constructors, getters, and setters are used instead of Lombok
 * to avoid relying on annotation processing and to keep the DTO simple
 * and consistent across different development environments.
 */
public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private List<String> roles;

    public AuthResponse() {
    }

    /**
     * Constructor used after successful authentication.
     * The token type defaults to "Bearer".
     */
    public AuthResponse(String token,
                        Long id,
                        String username,
                        String email,
                        String fullName,
                        List<String> roles) {

        this.token = token;
        this.type = "Bearer";
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}