package com.studypilot.service;

import com.studypilot.dto.DashboardDto;
import com.studypilot.dto.DocumentDto;
import com.studypilot.dto.YoutubeVideoDto;
import com.studypilot.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired private DocumentRepository documentRepository;
    @Autowired private YoutubeVideoRepository youtubeVideoRepository;
    @Autowired private NoteRepository noteRepository;
    @Autowired private ChatHistoryRepository chatHistoryRepository;
    @Autowired private FavoriteRepository favoriteRepository;
    @Autowired private ImportantQuestionRepository importantQuestionRepository;
    @Autowired private QuizAttemptRepository quizAttemptRepository;
    @Autowired private StudyPlanRepository studyPlanRepository;

    @Autowired private UserService userService;
    @Autowired private DocumentService documentService;
    @Autowired private YoutubeService youtubeService;

    public DashboardDto getDashboard() {
        Long userId = userService.getCurrentUserId();

        DashboardDto dto = new DashboardDto();

        // Original fields
        dto.setTotalDocuments(documentRepository.countByUserId(userId));
        dto.setTotalVideos(youtubeVideoRepository.countByUserId(userId));
        dto.setTotalNotes(noteRepository.countByUserId(userId));
        dto.setTotalChats(chatHistoryRepository.countByUserId(userId));

        // 5 most recent documents
        List<DocumentDto> recentDocs = documentRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream().limit(5)
                .map(documentService::mapToDto)
                .collect(Collectors.toList());
        dto.setRecentDocuments(recentDocs);

        // 5 most recent videos
        List<YoutubeVideoDto> recentVideos = youtubeVideoRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream().limit(5)
                .map(v -> youtubeService.mapToDto(v, false))
                .collect(Collectors.toList());
        dto.setRecentVideos(recentVideos);

        // Phase 1 new fields
        dto.setTotalFavorites(favoriteRepository.countByUserId(userId));
        dto.setTotalImportantQuestions(importantQuestionRepository.countByUserId(userId));

        // Phase 2 — Quiz stats
        dto.setTotalQuizAttempts(quizAttemptRepository.countByUserId(userId));
        Double avg = quizAttemptRepository.findAvgScoreByUserId(userId);
        dto.setAverageQuizScore(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        int best = quizAttemptRepository.findBestScoreByUserId(userId).orElse(0);
        dto.setBestQuizScore(best);

        // Phase 3 — Study Planner stats
        dto.setTotalStudyPlans(studyPlanRepository.countByUserId(userId));
        dto.setCompletedStudyPlans(studyPlanRepository.countByUserIdAndStatus(userId, "COMPLETED"));
        dto.setPendingStudyPlans(studyPlanRepository.countByUserIdAndStatus(userId, "PENDING"));

        return dto;
    }
}