package com.studypilot.repository;

import com.studypilot.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    // Get all documents uploaded by a specific user, newest first
    List<Document> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Count how many documents a user has uploaded
    long countByUserId(Long userId);

    // Search inside extracted text using SQL LIKE — no vector DB needed
    List<Document> findByUserIdAndExtractedTextContainingIgnoreCase(Long userId, String keyword);
}