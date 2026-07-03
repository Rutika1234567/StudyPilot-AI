package com.studypilot.controller;

import com.studypilot.dto.ApiResponse;
import com.studypilot.dto.QuizAttemptDto;
import com.studypilot.dto.QuizSubmitRequest;
import com.studypilot.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
@Tag(name = "Quiz", description = "Submit quiz attempts and view history")
@SecurityRequirement(name = "Bearer Authentication")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping("/submit")
    @Operation(summary = "Submit a completed quiz")
    public ResponseEntity<ApiResponse<QuizAttemptDto>> submit(@RequestBody QuizSubmitRequest request) {
        QuizAttemptDto dto = quizService.submitQuiz(request);
        return ResponseEntity.ok(ApiResponse.success("Quiz submitted", dto));
    }

    @GetMapping("/history")
    @Operation(summary = "Get quiz history for current user")
    public ResponseEntity<ApiResponse<List<QuizAttemptDto>>> getHistory() {
        return ResponseEntity.ok(ApiResponse.success(quizService.getMyHistory()));
    }

    @GetMapping("/history/{id}")
    @Operation(summary = "Get a single quiz attempt with full answers")
    public ResponseEntity<ApiResponse<QuizAttemptDto>> getAttempt(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getAttemptById(id)));
    }
}