package com.studypilot.repository;

import com.studypilot.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);

    @Query("SELECT COALESCE(AVG(q.score), 0) FROM QuizAttempt q WHERE q.user.id = :userId")
    Double findAvgScoreByUserId(Long userId);

    @Query("SELECT COALESCE(MAX(q.score), 0) FROM QuizAttempt q WHERE q.user.id = :userId")
    Optional<Integer> findBestScoreByUserId(Long userId);
}