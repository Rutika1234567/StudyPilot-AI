package com.studypilot.service;

import com.studypilot.dto.QuizAttemptDto;
import com.studypilot.dto.QuizSubmitRequest;
import com.studypilot.entity.QuizAttempt;
import com.studypilot.repository.McqRepository;
import com.studypilot.repository.QuizAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuizService {

    @Autowired private QuizAttemptRepository quizAttemptRepository;
    @Autowired private McqRepository mcqRepository;
    @Autowired private UserService userService;

    public QuizAttemptDto submitQuiz(QuizSubmitRequest request) {
        int total = request.getTotalQuestions() != null ? request.getTotalQuestions() : 10;
        int correct = request.getCorrectAnswers() != null ? request.getCorrectAnswers() : 0;
        int scorePct = total > 0 ? (int) Math.round((double) correct / total * 100) : 0;

        QuizAttempt attempt = new QuizAttempt();
        attempt.setUser(userService.getCurrentUser());

        if (request.getMcqId() != null) {
            mcqRepository.findById(request.getMcqId()).ifPresent(attempt::setMcq);
        }

        attempt.setTopic(request.getTopic());
        attempt.setTotalQuestions(total);
        attempt.setCorrectAnswers(correct);
        attempt.setScore(scorePct);
        attempt.setTimeTakenSeconds(request.getTimeTakenSeconds());
        attempt.setAnswersJson(request.getAnswersJson());

        quizAttemptRepository.save(attempt);
        return mapToDto(attempt);
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptDto> getMyHistory() {
        Long userId = userService.getCurrentUserId();
        return quizAttemptRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuizAttemptDto getAttemptById(Long id) {
        Long userId = userService.getCurrentUserId();
        QuizAttempt attempt = quizAttemptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));
        if (!attempt.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return mapToDto(attempt);
    }

    public QuizAttemptDto mapToDto(QuizAttempt a) {
        QuizAttemptDto dto = new QuizAttemptDto();
        dto.setId(a.getId());
        dto.setTopic(a.getTopic());
        dto.setTotalQuestions(a.getTotalQuestions());
        dto.setCorrectAnswers(a.getCorrectAnswers());
        dto.setScore(a.getScore());
        dto.setTimeTakenSeconds(a.getTimeTakenSeconds());
        dto.setAnswersJson(a.getAnswersJson());
        dto.setCreatedAt(a.getCreatedAt());
        if (a.getMcq() != null) dto.setMcqId(a.getMcq().getId());
        return dto;
    }
}