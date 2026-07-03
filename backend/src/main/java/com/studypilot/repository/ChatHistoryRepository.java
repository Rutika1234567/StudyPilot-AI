package com.studypilot.repository;

import com.studypilot.entity.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {

    // Get all chat messages for a user, newest first
    List<ChatHistory> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Get chat history for a specific document conversation
    List<ChatHistory> findByDocumentIdOrderByCreatedAtAsc(Long documentId);

    // Get chat history for a specific video conversation
    List<ChatHistory> findByYoutubeVideoIdOrderByCreatedAtAsc(Long videoId);

    // Count total chat messages for a user (used in dashboard)
    long countByUserId(Long userId);
}