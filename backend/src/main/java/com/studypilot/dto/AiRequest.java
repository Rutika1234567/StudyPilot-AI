package com.studypilot.dto;

public class AiRequest {

    // Set this if generating from a document
    private Long documentId;

    // Set this if generating from a video
    private Long videoId;

    // SUMMARY, SHORT_NOTES, CHAPTER_WISE, MCQ,
    // INTERVIEW, FLASHCARD, VIVA, IMPORTANT_TOPICS
    private String contentType;

    public AiRequest() {
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

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
}