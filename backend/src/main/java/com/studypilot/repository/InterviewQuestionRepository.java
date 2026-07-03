package com.studypilot.repository;

import com.studypilot.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {

    List<InterviewQuestion> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<InterviewQuestion> findByDocumentIdOrderByCreatedAtDesc(Long documentId);

    List<InterviewQuestion> findByYoutubeVideoIdOrderByCreatedAtDesc(Long videoId);
}