package com.studypilot.repository;

import com.studypilot.entity.Mcq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface McqRepository extends JpaRepository<Mcq, Long> {

    List<Mcq> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Mcq> findByDocumentIdOrderByCreatedAtDesc(Long documentId);

    List<Mcq> findByYoutubeVideoIdOrderByCreatedAtDesc(Long videoId);
}