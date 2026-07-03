package com.studypilot.controller;

import com.studypilot.dto.ApiResponse;
import com.studypilot.dto.StudyPlanDto;
import com.studypilot.dto.StudyPlanRequest;
import com.studypilot.service.StudyPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/study-plans")
@Tag(name = "Study Planner", description = "Create and manage study plans")
@SecurityRequirement(name = "Bearer Authentication")
public class StudyPlanController {

    @Autowired
    private StudyPlanService studyPlanService;

    @PostMapping
    @Operation(summary = "Create a new study plan")
    public ResponseEntity<ApiResponse<StudyPlanDto>> create(@RequestBody StudyPlanRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Study plan created", studyPlanService.createPlan(request)));
    }

    @GetMapping
    @Operation(summary = "Get all study plans for current user")
    public ResponseEntity<ApiResponse<List<StudyPlanDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(studyPlanService.getMyPlans()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single study plan by ID")
    public ResponseEntity<ApiResponse<StudyPlanDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(studyPlanService.getPlanById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a study plan")
    public ResponseEntity<ApiResponse<StudyPlanDto>> update(
            @PathVariable Long id,
            @RequestBody StudyPlanRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Updated", studyPlanService.updatePlan(id, request)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update only the status (PENDING | IN_PROGRESS | COMPLETED)")
    public ResponseEntity<ApiResponse<StudyPlanDto>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(ApiResponse.success("Status updated", studyPlanService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a study plan")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        studyPlanService.deletePlan(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted", null));
    }
}