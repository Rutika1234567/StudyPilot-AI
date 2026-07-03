package com.studypilot.dto;

public class FavoriteRequest {

    // SUMMARY | NOTE | MCQ | FLASHCARD | INTERVIEW_QUESTION | IMPORTANT_QUESTION
    private String contentType;
    private Long contentId;
    private String title;
    private String contentPreview;

    public FavoriteRequest() {
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getContentId() {
        return contentId;
    }

    public void setContentId(Long contentId) {
        this.contentId = contentId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContentPreview() {
        return contentPreview;
    }

    public void setContentPreview(String contentPreview) {
        this.contentPreview = contentPreview;
    }
}