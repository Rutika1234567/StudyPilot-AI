package com.studypilot.controller;

import com.studypilot.dto.ApiResponse;
import com.studypilot.dto.DashboardDto;
import com.studypilot.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Dashboard statistics and recent activity")
@SecurityRequirement(name = "Bearer Authentication")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // GET /api/dashboard
    // Returns counts + recent documents and videos in one call
    @GetMapping
    @Operation(summary = "Get dashboard statistics for current user")
    public ResponseEntity<ApiResponse<DashboardDto>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboard()));
    }
}