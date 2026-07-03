package com.studypilot.repository;

import com.studypilot.entity.ImportantQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportantQuestionRepository extends JpaRepository<ImportantQuestion, Long> {

    List<ImportantQuestion> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<ImportantQuestion> findByDocumentIdOrderByCreatedAtDesc(Long documentId);

    List<ImportantQuestion> findByYoutubeVideoIdOrderByCreatedAtDesc(Long videoId);

    long countByUserId(Long userId);
}