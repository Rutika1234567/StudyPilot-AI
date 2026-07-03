package com.studypilot.controller;

import com.studypilot.dto.ApiResponse;
import com.studypilot.dto.UpdateProfileRequest;
import com.studypilot.dto.UserProfileDto;
import com.studypilot.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@Tag(name = "User Profile", description = "View and update user profile")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    @Autowired
    private UserService userService;

    // GET /api/user/profile
    // Returns the currently logged-in user's profile
    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile() {
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile()));
    }

    // PUT /api/user/profile
    // Body: { "fullName": "John Doe", "bio": "I love learning" }
    @PutMapping("/profile")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @RequestBody UpdateProfileRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success("Profile updated", userService.updateProfile(request)));
    }
}