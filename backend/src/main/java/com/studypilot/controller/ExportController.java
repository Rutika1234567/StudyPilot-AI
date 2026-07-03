package com.studypilot.controller;

import com.studypilot.service.ExportPdfService;
import com.studypilot.service.UserService;
import com.studypilot.repository.*;
import com.studypilot.entity.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/export")
@Tag(name = "Export PDF", description = "Export AI-generated content as PDF")
@SecurityRequirement(name = "Bearer Authentication")
public class ExportController {

    @Autowired private ExportPdfService exportPdfService;
    @Autowired private UserService userService;
    @Autowired private SummaryRepository summaryRepository;
    @Autowired private NoteRepository noteRepository;
    @Autowired private McqRepository mcqRepository;
    @Autowired private FlashcardRepository flashcardRepository;
    @Autowired private InterviewQuestionRepository interviewQuestionRepository;
    @Autowired private ImportantQuestionRepository importantQuestionRepository;

    @GetMapping("/summary/{id}")
    @Operation(summary = "Export a summary as PDF")
    public ResponseEntity<byte[]> exportSummary(@PathVariable Long id) throws Exception {
        Summary entity = summaryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Summary not found"));
        checkOwner(entity.getUser().getId());
        byte[] pdf = exportPdfService.generatePdf(
                "Summary", "SUMMARY", entity.getContent());
        return pdfResponse("summary_" + id + ".pdf", pdf);
    }

    @GetMapping("/notes/{id}")
    @Operation(summary = "Export notes as PDF")
    public ResponseEntity<byte[]> exportNote(@PathVariable Long id) throws Exception {
        Note entity = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        checkOwner(entity.getUser().getId());
        byte[] pdf = exportPdfService.generatePdf(
                entity.getTitle() != null ? entity.getTitle() : "Notes",
                entity.getNoteType() != null ? entity.getNoteType() : "NOTE",
                entity.getContent());
        return pdfResponse("notes_" + id + ".pdf", pdf);
    }

    @GetMapping("/mcqs/{id}")
    @Operation(summary = "Export MCQs as PDF")
    public ResponseEntity<byte[]> exportMcqs(@PathVariable Long id) throws Exception {
        Mcq entity = mcqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MCQ not found"));
        checkOwner(entity.getUser().getId());
        byte[] pdf = exportPdfService.generatePdf("MCQ Questions", "MCQ", entity.getContent());
        return pdfResponse("mcqs_" + id + ".pdf", pdf);
    }

    @GetMapping("/flashcards/{id}")
    @Operation(summary = "Export flashcards as PDF")
    public ResponseEntity<byte[]> exportFlashcards(@PathVariable Long id) throws Exception {
        Flashcard entity = flashcardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flashcard not found"));
        checkOwner(entity.getUser().getId());
        byte[] pdf = exportPdfService.generatePdf("Flashcards", "FLASHCARD", entity.getContent());
        return pdfResponse("flashcards_" + id + ".pdf", pdf);
    }

    @GetMapping("/interview-questions/{id}")
    @Operation(summary = "Export interview questions as PDF")
    public ResponseEntity<byte[]> exportInterview(@PathVariable Long id) throws Exception {
        InterviewQuestion entity = interviewQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview questions not found"));
        checkOwner(entity.getUser().getId());
        byte[] pdf = exportPdfService.generatePdf("Interview Questions", "INTERVIEW", entity.getContent());
        return pdfResponse("interview_" + id + ".pdf", pdf);
    }

    @GetMapping("/important-questions/{id}")
    @Operation(summary = "Export important questions as PDF")
    public ResponseEntity<byte[]> exportImportantQuestions(@PathVariable Long id) throws Exception {
        ImportantQuestion entity = importantQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Important questions not found"));
        checkOwner(entity.getUser().getId());
        byte[] pdf = exportPdfService.generatePdf("Important Questions", "IMPORTANT_QUESTIONS", entity.getContent());
        return pdfResponse("important_questions_" + id + ".pdf", pdf);
    }

    // ---- helper ----

    private void checkOwner(Long ownerId) {
        Long currentUserId = userService.getCurrentUserId();
        if (!ownerId.equals(currentUserId)) {
            throw new RuntimeException("Access denied");
        }
    }

    private ResponseEntity<byte[]> pdfResponse(String filename, byte[] pdf) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(pdf);
    }
}