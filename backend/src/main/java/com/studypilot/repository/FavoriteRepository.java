package com.studypilot.repository;

import com.studypilot.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Favorite> findByUserIdAndContentTypeOrderByCreatedAtDesc(Long userId, String contentType);

    Optional<Favorite> findByUserIdAndContentTypeAndContentId(Long userId, String contentType, Long contentId);

    boolean existsByUserIdAndContentTypeAndContentId(Long userId, String contentType, Long contentId);

    long countByUserId(Long userId);

    void deleteByUserIdAndContentTypeAndContentId(Long userId, String contentType, Long contentId);
}