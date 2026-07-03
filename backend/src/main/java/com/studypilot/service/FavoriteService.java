package com.studypilot.service;

import com.studypilot.dto.FavoriteDto;
import com.studypilot.dto.FavoriteRequest;
import com.studypilot.entity.Favorite;
import com.studypilot.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FavoriteService {

    @Autowired private FavoriteRepository favoriteRepository;
    @Autowired private UserService userService;

    public FavoriteDto addFavorite(FavoriteRequest request) {
        Long userId = userService.getCurrentUserId();

        // Prevent duplicates
        if (favoriteRepository.existsByUserIdAndContentTypeAndContentId(
                userId, request.getContentType(), request.getContentId())) {
            // Return existing
            return favoriteRepository
                    .findByUserIdAndContentTypeAndContentId(userId, request.getContentType(), request.getContentId())
                    .map(this::mapToDto)
                    .orElseThrow();
        }

        Favorite favorite = new Favorite();
        favorite.setUser(userService.getCurrentUser());
        favorite.setContentType(request.getContentType());
        favorite.setContentId(request.getContentId());
        favorite.setTitle(request.getTitle());
        // Store first 500 chars as preview
        String preview = request.getContentPreview();
        if (preview != null && preview.length() > 500) {
            preview = preview.substring(0, 500) + "...";
        }
        favorite.setContentPreview(preview);
        favoriteRepository.save(favorite);
        return mapToDto(favorite);
    }

    @Transactional(readOnly = true)
    public List<FavoriteDto> getMyFavorites() {
        Long userId = userService.getCurrentUserId();
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FavoriteDto> getMyFavoritesByType(String contentType) {
        Long userId = userService.getCurrentUserId();
        return favoriteRepository.findByUserIdAndContentTypeOrderByCreatedAtDesc(userId, contentType)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public void removeFavorite(Long favoriteId) {
        Long userId = userService.getCurrentUserId();
        Favorite favorite = favoriteRepository.findById(favoriteId)
                .orElseThrow(() -> new RuntimeException("Favorite not found"));
        if (!favorite.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        favoriteRepository.delete(favorite);
    }

    @Transactional(readOnly = true)
    public boolean isFavorited(String contentType, Long contentId) {
        Long userId = userService.getCurrentUserId();
        return favoriteRepository.existsByUserIdAndContentTypeAndContentId(userId, contentType, contentId);
    }

    private FavoriteDto mapToDto(Favorite f) {
        FavoriteDto dto = new FavoriteDto();
        dto.setId(f.getId());
        dto.setContentType(f.getContentType());
        dto.setContentId(f.getContentId());
        dto.setTitle(f.getTitle());
        dto.setContentPreview(f.getContentPreview());
        dto.setCreatedAt(f.getCreatedAt());
        return dto;
    }
}