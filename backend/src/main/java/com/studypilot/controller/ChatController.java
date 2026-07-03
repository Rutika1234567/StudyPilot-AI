package com.studypilot.controller;

import com.studypilot.dto.ApiResponse;
import com.studypilot.dto.ChatHistoryDto;
import com.studypilot.dto.ChatRequest;
import com.studypilot.service.ContentGenerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@Tag(name = "Chat", description = "Ask questions about documents or YouTube videos")
@SecurityRequirement(name = "Bearer Authentication")
public class ChatController {

    @Autowired
    private ContentGenerationService contentGenerationService;

    // POST /api/chat/ask
    // Body: { "documentId": 1, "question": "What is machine learning?" }
    //   OR  { "videoId": 2,    "question": "Summarise chapter 3" }
    @PostMapping("/ask")
    @Operation(summary = "Ask a question about a document or YouTube video")
    public ResponseEntity<ApiResponse<ChatHistoryDto>> ask(
            @Valid @RequestBody ChatRequest request) {

        ChatHistoryDto response = contentGenerationService.chat(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // GET /api/chat/history — all chat messages across all documents/videos
    @GetMapping("/history")
    @Operation(summary = "Get all chat history for the current user")
    public ResponseEntity<ApiResponse<List<ChatHistoryDto>>> getAllHistory() {
        return ResponseEntity.ok(
                ApiResponse.success(contentGenerationService.getMyChatHistory()));
    }

    // GET /api/chat/history/document/{documentId}
    // Get the chat thread for a specific document (ordered oldest→newest)
    @GetMapping("/history/document/{documentId}")
    @Operation(summary = "Get chat history for a specific document")
    public ResponseEntity<ApiResponse<List<ChatHistoryDto>>> getDocumentChat(
            @PathVariable Long documentId) {

        return ResponseEntity.ok(
                ApiResponse.success(contentGenerationService.getDocumentChatHistory(documentId)));
    }

    // GET /api/chat/history/video/{videoId}
    @GetMapping("/history/video/{videoId}")
    @Operation(summary = "Get chat history for a specific YouTube video")
    public ResponseEntity<ApiResponse<List<ChatHistoryDto>>> getVideoChat(
            @PathVariable Long videoId) {

        return ResponseEntity.ok(
                ApiResponse.success(contentGenerationService.getVideoChatHistory(videoId)));
    }
}