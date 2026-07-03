package com.studypilot.controller;

import com.studypilot.dto.AiRequest;
import com.studypilot.dto.ApiResponse;
import com.studypilot.dto.ImportantQuestionDto;
import com.studypilot.service.ImportantQuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/important-questions")
@Tag(name = "Important Questions", description = "Generate and manage important exam questions")
@SecurityRequirement(name = "Bearer Authentication")
public class ImportantQuestionController {

    @Autowired
    private ImportantQuestionService importantQuestionService;

    @PostMapping("/generate")
    @Operation(summary = "Generate important questions from a document or video")
    public ResponseEntity<ApiResponse<ImportantQuestionDto>> generate(@RequestBody AiRequest request) {
        ImportantQuestionDto dto = importantQuestionService.generate(request);
        return ResponseEntity.ok(ApiResponse.success("Important questions generated", dto));
    }

    @GetMapping
    @Operation(summary = "Get all important questions for current user")
    public ResponseEntity<ApiResponse<List<ImportantQuestionDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(importantQuestionService.getMyImportantQuestions()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an important questions record")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        importantQuestionService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted", null));
    }
}