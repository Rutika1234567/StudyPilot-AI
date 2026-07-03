package com.studypilot.repository;

import com.studypilot.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Note> findByDocumentIdOrderByCreatedAtDesc(Long documentId);

    List<Note> findByYoutubeVideoIdOrderByCreatedAtDesc(Long videoId);

    long countByUserId(Long userId);
}