package com.studypilot.dto;

import jakarta.validation.constraints.NotBlank;

// Request: user submits this when pasting a YouTube URL
public class YoutubeRequest {

    @NotBlank(message = "YouTube URL is required")
    private String videoUrl;

    // OPTIONAL: if the user pastes the transcript text themselves (copied from
    // YouTube's own "Show transcript" panel under the video), it is used as a
    // fallback when automatic fetching fails or is blocked by YouTube.
    private String manualTranscript;

    public YoutubeRequest() {
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getManualTranscript() {
        return manualTranscript;
    }

    public void setManualTranscript(String manualTranscript) {
        this.manualTranscript = manualTranscript;
    }
}