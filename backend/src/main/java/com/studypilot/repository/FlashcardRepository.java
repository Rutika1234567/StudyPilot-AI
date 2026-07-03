package com.studypilot.repository;

import com.studypilot.entity.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {

    List<Flashcard> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Flashcard> findByDocumentIdOrderByCreatedAtDesc(Long documentId);

    List<Flashcard> findByYoutubeVideoIdOrderByCreatedAtDesc(Long videoId);
}