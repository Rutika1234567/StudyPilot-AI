package com.studypilot.controller;

import com.studypilot.dto.ApiResponse;
import com.studypilot.dto.FavoriteDto;
import com.studypilot.dto.FavoriteRequest;
import com.studypilot.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@Tag(name = "Favorites", description = "Save and manage favorite AI-generated content")
@SecurityRequirement(name = "Bearer Authentication")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @PostMapping
    @Operation(summary = "Add content to favorites")
    public ResponseEntity<ApiResponse<FavoriteDto>> addFavorite(@RequestBody FavoriteRequest request) {
        FavoriteDto dto = favoriteService.addFavorite(request);
        return ResponseEntity.ok(ApiResponse.success("Added to favorites", dto));
    }

    @GetMapping
    @Operation(summary = "Get all favorites for current user")
    public ResponseEntity<ApiResponse<List<FavoriteDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.getMyFavorites()));
    }

    @GetMapping("/type/{contentType}")
    @Operation(summary = "Get favorites filtered by content type")
    public ResponseEntity<ApiResponse<List<FavoriteDto>>> getByType(@PathVariable String contentType) {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.getMyFavoritesByType(contentType)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove a favorite")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long id) {
        favoriteService.removeFavorite(id);
        return ResponseEntity.ok(ApiResponse.success("Removed from favorites", null));
    }

    @GetMapping("/check")
    @Operation(summary = "Check if content is favorited")
    public ResponseEntity<ApiResponse<Boolean>> check(
            @RequestParam String contentType,
            @RequestParam Long contentId) {
        boolean favorited = favoriteService.isFavorited(contentType, contentId);
        return ResponseEntity.ok(ApiResponse.success(favorited));
    }
}