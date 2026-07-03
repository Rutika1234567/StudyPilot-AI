package com.studypilot.dto;

import java.time.LocalDateTime;

public class YoutubeVideoDto {

    private Long id;
    private String videoUrl;
    private String videoId;
    private String title;
    // transcript is large — only included when explicitly fetched
    private String transcript;
    // lets the frontend distinguish "no captions" from a loading/error state
    private boolean hasTranscript;
    private LocalDateTime createdAt;

    public YoutubeVideoDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getVideoId() {
        return videoId;
    }

    public void setVideoId(String videoId) {
        this.videoId = videoId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTranscript() {
        return transcript;
    }

    public void setTranscript(String transcript) {
        this.transcript = transcript;
    }

    public boolean isHasTranscript() {
        return hasTranscript;
    }

    public void setHasTranscript(boolean hasTranscript) {
        this.hasTranscript = hasTranscript;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}