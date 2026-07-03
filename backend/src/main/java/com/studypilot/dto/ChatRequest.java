package com.studypilot.dto;

import jakarta.validation.constraints.NotBlank;

// User sends this when asking a question about a document or video
public class ChatRequest {

    // null if chatting about a video
    private Long documentId;

    // null if chatting about a document
    private Long videoId;

    @NotBlank(message = "Question cannot be empty")
    private String question;

    public ChatRequest() {
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public Long getVideoId() {
        return videoId;
    }

    public void setVideoId(Long videoId) {
        this.videoId = videoId;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }
}