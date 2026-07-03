package com.studypilot.controller;

import com.studypilot.dto.ApiResponse;
import com.studypilot.dto.YoutubeRequest;
import com.studypilot.dto.YoutubeVideoDto;
import com.studypilot.entity.YoutubeVideo;
import com.studypilot.service.YoutubeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/youtube")
@Tag(name = "YouTube Videos", description = "Add YouTube URLs and fetch transcripts")
@SecurityRequirement(name = "Bearer Authentication")
public class YoutubeController {

    @Autowired
    private YoutubeService youtubeService;

    // POST /api/youtube/add
    // Body: { "videoUrl": "https://www.youtube.com/watch?v=..." }
    @PostMapping("/add")
    @Operation(summary = "Add a YouTube video URL and fetch its transcript")
    public ResponseEntity<ApiResponse<YoutubeVideoDto>> addVideo(
            @Valid @RequestBody YoutubeRequest request) {

        YoutubeVideoDto dto = youtubeService.addVideo(request);
        return ResponseEntity.ok(ApiResponse.success("Video added and transcript fetched", dto));
    }

    // GET /api/youtube
    @GetMapping
    @Operation(summary = "Get all YouTube videos for current user")
    public ResponseEntity<ApiResponse<List<YoutubeVideoDto>>> getMyVideos() {
        return ResponseEntity.ok(ApiResponse.success(youtubeService.getMyVideos()));
    }

    // GET /api/youtube/{id}
    // FIX: Map entity -> DTO before returning. The raw entity has a LAZY 'user'
    // field; Jackson tries to serialize it AFTER the @Transactional session in
    // YoutubeService has already closed, which throws LazyInitializationException
    // -> 500 error -> frontend shows "Video not found".
    @GetMapping("/{id}")
    @Operation(summary = "Get a specific video with full transcript")
    public ResponseEntity<ApiResponse<YoutubeVideoDto>> getVideo(@PathVariable Long id) {
        YoutubeVideo video = youtubeService.getVideoById(id);
        YoutubeVideoDto dto = youtubeService.mapToDto(video, true); // true = include transcript
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    // DELETE /api/youtube/{id}
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a YouTube video")
    public ResponseEntity<ApiResponse<Void>> deleteVideo(@PathVariable Long id) {
        youtubeService.deleteVideo(id);
        return ResponseEntity.ok(ApiResponse.success("Video deleted", null));
    }
}