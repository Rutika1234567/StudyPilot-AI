package com.studypilot.controller;

import com.studypilot.dto.ApiResponse;
import com.studypilot.dto.DocumentDto;
import com.studypilot.dto.UserProfileDto;
import com.studypilot.service.DocumentService;
import com.studypilot.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// @PreAuthorize("hasRole('ADMIN')") ensures only admins can reach these endpoints.
// Spring Security checks the role from the JWT token.
@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin-only endpoints for user and document management")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired private UserService userService;
    @Autowired private DocumentService documentService;

    // GET /api/admin/users — list all registered users
    @GetMapping("/users")
    @Operation(summary = "Get all users (Admin only)")
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    // DELETE /api/admin/users/{id} — delete any user
    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete a user by ID (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }

    // GET /api/admin/documents — see all uploaded documents from all users
    @GetMapping("/documents")
    @Operation(summary = "Get all documents from all users (Admin only)")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getAllDocuments() {
        return ResponseEntity.ok(ApiResponse.success(documentService.getAllDocuments()));
    }
}