package com.studypilot.service;

import com.studypilot.dto.AiRequest;
import com.studypilot.dto.ImportantQuestionDto;
import com.studypilot.entity.Document;
import com.studypilot.entity.ImportantQuestion;
import com.studypilot.entity.YoutubeVideo;
import com.studypilot.repository.ImportantQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ImportantQuestionService {

    @Autowired private AiService aiService;
    @Autowired private UserService userService;
    @Autowired private DocumentService documentService;
    @Autowired private YoutubeService youtubeService;
    @Autowired private ImportantQuestionRepository importantQuestionRepository;

    public ImportantQuestionDto generate(AiRequest request) {
        String text = getSourceText(request.getDocumentId(), request.getVideoId());
        String content = aiService.generateImportantQuestions(text);

        ImportantQuestion iq = new ImportantQuestion();
        iq.setUser(userService.getCurrentUser());
        iq.setDocument(request.getDocumentId() != null
                ? documentService.getDocumentById(request.getDocumentId()) : null);
        iq.setYoutubeVideo(request.getVideoId() != null
                ? youtubeService.getVideoById(request.getVideoId()) : null);
        iq.setContent(content);
        importantQuestionRepository.save(iq);

        return mapToDto(iq);
    }

    @Transactional(readOnly = true)
    public List<ImportantQuestionDto> getMyImportantQuestions() {
        Long userId = userService.getCurrentUserId();
        return importantQuestionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ImportantQuestion getById(Long id) {
        return importantQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Important question not found: " + id));
    }

    public void delete(Long id) {
        Long userId = userService.getCurrentUserId();
        ImportantQuestion iq = getById(id);
        if (!iq.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        importantQuestionRepository.delete(iq);
    }

    // ---- helpers ----

    private String getSourceText(Long documentId, Long videoId) {
        if (documentId != null) {
            Document doc = documentService.getDocumentById(documentId);
            if (doc.getExtractedText() == null || doc.getExtractedText().isBlank()) {
                throw new RuntimeException("Document has no extracted text");
            }
            return doc.getExtractedText();
        } else if (videoId != null) {
            YoutubeVideo video = youtubeService.getVideoById(videoId);
            String transcript = video.getTranscript();
            boolean missing = transcript == null || transcript.isBlank()
                    || YoutubeService.NO_TRANSCRIPT_MARKER.equals(transcript)
                    || transcript.startsWith("Transcript not available");
            if (missing) {
                throw new RuntimeException("This video has no captions available.");
            }
            return transcript;
        }
        throw new RuntimeException("Either documentId or videoId must be provided");
    }

    public ImportantQuestionDto mapToDto(ImportantQuestion iq) {
        ImportantQuestionDto dto = new ImportantQuestionDto();
        dto.setId(iq.getId());
        dto.setContent(iq.getContent());
        dto.setCreatedAt(iq.getCreatedAt());
        if (iq.getDocument() != null) dto.setDocumentId(iq.getDocument().getId());
        if (iq.getYoutubeVideo() != null) dto.setVideoId(iq.getYoutubeVideo().getId());
        return dto;
    }
}