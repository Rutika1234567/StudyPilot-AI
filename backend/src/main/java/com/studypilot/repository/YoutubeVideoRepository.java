package com.studypilot.repository;

import com.studypilot.entity.YoutubeVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface YoutubeVideoRepository extends JpaRepository<YoutubeVideo, Long> {

    List<YoutubeVideo> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);
}