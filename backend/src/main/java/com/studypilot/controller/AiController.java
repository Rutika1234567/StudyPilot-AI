package com.studypilot.controller;

import com.studypilot.dto.*;
import com.studypilot.service.ContentGenerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// All AI generation goes through this one controller.
// The client sends either documentId or videoId in the request body.
// contentType tells us what to generate.
@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Generation", description = "Generate summaries, notes, MCQs, flashcards, interview questions")
@SecurityRequirement(name = "Bearer Authentication")
public class AiController {

    @Autowired
    private ContentGenerationService contentGenerationService;

    // -----------------------------------------------------------------------
    // POST /api/ai/summary
    // Body: { "documentId": 1 }  OR  { "videoId": 2 }
    // -----------------------------------------------------------------------
    @PostMapping("/summary")
    @Operation(summary = "Generate a summary from a document or YouTube video")
    public ResponseEntity<ApiResponse<SummaryDto>> generateSummary(
            @RequestBody AiRequest request) {

        SummaryDto dto = contentGenerationService.generateSummary(request);
        return ResponseEntity.ok(ApiResponse.success("Summary generated", dto));
    }

    // -----------------------------------------------------------------------
    // POST /api/ai/notes
    // contentType: SHORT_NOTES | CHAPTER_WISE | VIVA | IMPORTANT_TOPICS
    // -----------------------------------------------------------------------
    @PostMapping("/notes")
    @Operation(summary = "Generate notes. contentType: SHORT_NOTES | CHAPTER_WISE | VIVA | IMPORTANT_TOPICS")
    public ResponseEntity<ApiResponse<NoteDto>> generateNotes(
            @RequestBody AiRequest request) {

        NoteDto dto = contentGenerationService.generateNote(request);
        return ResponseEntity.ok(ApiResponse.success("Notes generated", dto));
    }

    // -----------------------------------------------------------------------
    // POST /api/ai/mcqs
    // -----------------------------------------------------------------------
    @PostMapping("/mcqs")
    @Operation(summary = "Generate 10 multiple-choice questions")
    public ResponseEntity<ApiResponse<McqDto>> generateMcqs(
            @RequestBody AiRequest request) {

        McqDto dto = contentGenerationService.generateMcqs(request);
        return ResponseEntity.ok(ApiResponse.success("MCQs generated", dto));
    }

    // -----------------------------------------------------------------------
    // POST /api/ai/flashcards
    // -----------------------------------------------------------------------
    @PostMapping("/flashcards")
    @Operation(summary = "Generate flashcards (front/back format)")
    public ResponseEntity<ApiResponse<FlashcardDto>> generateFlashcards(
            @RequestBody AiRequest request) {

        FlashcardDto dto = contentGenerationService.generateFlashcards(request);
        return ResponseEntity.ok(ApiResponse.success("Flashcards generated", dto));
    }

    // -----------------------------------------------------------------------
    // POST /api/ai/interview-questions
    // -----------------------------------------------------------------------
    @PostMapping("/interview-questions")
    @Operation(summary = "Generate interview questions with answers")
    public ResponseEntity<ApiResponse<InterviewQuestionDto>> generateInterviewQuestions(
            @RequestBody AiRequest request) {

        InterviewQuestionDto dto = contentGenerationService.generateInterviewQuestions(request);
        return ResponseEntity.ok(ApiResponse.success("Interview questions generated", dto));
    }

    // -----------------------------------------------------------------------
    // History endpoints — retrieve saved AI-generated content
    // -----------------------------------------------------------------------
    @GetMapping("/notes")
    @Operation(summary = "Get all saved notes for current user")
    public ResponseEntity<ApiResponse<List<NoteDto>>> getMyNotes() {
        return ResponseEntity.ok(ApiResponse.success(contentGenerationService.getMyNotes()));
    }

    @GetMapping("/summaries")
    @Operation(summary = "Get all saved summaries for current user")
    public ResponseEntity<ApiResponse<List<SummaryDto>>> getMySummaries() {
        return ResponseEntity.ok(ApiResponse.success(contentGenerationService.getMySummaries()));
    }

    @GetMapping("/mcqs")
    @Operation(summary = "Get all saved MCQs for current user")
    public ResponseEntity<ApiResponse<List<McqDto>>> getMyMcqs() {
        return ResponseEntity.ok(ApiResponse.success(contentGenerationService.getMyMcqs()));
    }

    @GetMapping("/flashcards")
    @Operation(summary = "Get all saved flashcards for current user")
    public ResponseEntity<ApiResponse<List<FlashcardDto>>> getMyFlashcards() {
        return ResponseEntity.ok(ApiResponse.success(contentGenerationService.getMyFlashcards()));
    }

    @GetMapping("/interview-questions")
    @Operation(summary = "Get all saved interview questions for current user")
    public ResponseEntity<ApiResponse<List<InterviewQuestionDto>>> getMyInterviewQuestions() {
        return ResponseEntity.ok(
                ApiResponse.success(contentGenerationService.getMyInterviewQuestions()));
    }
}