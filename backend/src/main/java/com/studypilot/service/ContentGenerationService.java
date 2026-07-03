package com.studypilot.service;

import com.studypilot.dto.*;
import com.studypilot.entity.*;
import com.studypilot.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

// This service sits between the controller and AiService.
// It: 1) loads the document/video text  2) calls AiService  3) saves the result to DB
@Service
@org.springframework.transaction.annotation.Transactional
public class ContentGenerationService {

    @Autowired private AiService aiService;
    @Autowired private UserService userService;
    @Autowired private DocumentService documentService;
    @Autowired private YoutubeService youtubeService;

    @Autowired private NoteRepository noteRepository;
    @Autowired private SummaryRepository summaryRepository;
    @Autowired private McqRepository mcqRepository;
    @Autowired private FlashcardRepository flashcardRepository;
    @Autowired private InterviewQuestionRepository interviewQuestionRepository;
    @Autowired private ChatHistoryRepository chatHistoryRepository;

    // -----------------------------------------------------------------------
    // Get the raw text from either a document or a YouTube video
    // -----------------------------------------------------------------------
    // NEW: also reject the internal "no transcript" sentinel and old placeholder text,
// so the AI is never asked to summarize a "transcript not available" message.
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
            boolean missing = transcript == null
                    || transcript.isBlank()
                    || YoutubeService.NO_TRANSCRIPT_MARKER.equals(transcript)
                    || transcript.startsWith("Transcript not available"); // legacy rows saved before this fix
            if (missing) {
                throw new RuntimeException(
                        "This video has no captions available, so AI features and chat cannot be used for it. " +
                                "Try a different video that has captions enabled.");
            }
            return transcript;
        }
        throw new RuntimeException("Either documentId or videoId must be provided");
    }

    private Document getDocumentIfSet(Long documentId) {
        return documentId != null ? documentService.getDocumentById(documentId) : null;
    }

    private YoutubeVideo getVideoIfSet(Long videoId) {
        return videoId != null ? youtubeService.getVideoById(videoId) : null;
    }

    // -----------------------------------------------------------------------
    // SUMMARY
    // -----------------------------------------------------------------------
    public SummaryDto generateSummary(AiRequest request) {
        String text = getSourceText(request.getDocumentId(), request.getVideoId());
        String content = aiService.generateSummary(text);

        Summary summary = new Summary();
        summary.setUser(userService.getCurrentUser());
        summary.setDocument(getDocumentIfSet(request.getDocumentId()));
        summary.setYoutubeVideo(getVideoIfSet(request.getVideoId()));
        summary.setContent(content);
        summary.setSummaryType("SUMMARY");
        summaryRepository.save(summary);

        return mapSummary(summary);
    }

    // -----------------------------------------------------------------------
    // NOTES (SHORT_NOTES, CHAPTER_WISE, VIVA, IMPORTANT_TOPICS)
    // -----------------------------------------------------------------------
    public NoteDto generateNote(AiRequest request) {
        String text = getSourceText(request.getDocumentId(), request.getVideoId());
        String noteType = request.getContentType() != null
                ? request.getContentType() : "SHORT_NOTES";

        String content = switch (noteType) {
            case "CHAPTER_WISE"      -> aiService.generateChapterWiseNotes(text);
            case "VIVA"              -> aiService.generateVivaQuestions(text);
            case "IMPORTANT_TOPICS"  -> aiService.generateImportantTopics(text);
            default                  -> aiService.generateShortNotes(text);  // SHORT_NOTES
        };

        Note note = new Note();
        note.setUser(userService.getCurrentUser());
        note.setDocument(getDocumentIfSet(request.getDocumentId()));
        note.setYoutubeVideo(getVideoIfSet(request.getVideoId()));
        note.setTitle(noteType + " Notes");
        note.setContent(content);
        note.setNoteType(noteType);
        noteRepository.save(note);

        return mapNote(note);
    }

    // -----------------------------------------------------------------------
    // MCQs
    // -----------------------------------------------------------------------
    public McqDto generateMcqs(AiRequest request) {
        String text = getSourceText(request.getDocumentId(), request.getVideoId());
        String content = aiService.generateMcqs(text);

        Mcq mcq = new Mcq();
        mcq.setUser(userService.getCurrentUser());
        mcq.setDocument(getDocumentIfSet(request.getDocumentId()));
        mcq.setYoutubeVideo(getVideoIfSet(request.getVideoId()));
        mcq.setContent(content);
        mcqRepository.save(mcq);

        return mapMcq(mcq);
    }

    // -----------------------------------------------------------------------
    // FLASHCARDS
    // -----------------------------------------------------------------------
    public FlashcardDto generateFlashcards(AiRequest request) {
        String text = getSourceText(request.getDocumentId(), request.getVideoId());
        String content = aiService.generateFlashcards(text);

        Flashcard flashcard = new Flashcard();
        flashcard.setUser(userService.getCurrentUser());
        flashcard.setDocument(getDocumentIfSet(request.getDocumentId()));
        flashcard.setYoutubeVideo(getVideoIfSet(request.getVideoId()));
        flashcard.setContent(content);
        flashcardRepository.save(flashcard);

        return mapFlashcard(flashcard);
    }

    // -----------------------------------------------------------------------
    // INTERVIEW QUESTIONS
    // -----------------------------------------------------------------------
    public InterviewQuestionDto generateInterviewQuestions(AiRequest request) {
        String text = getSourceText(request.getDocumentId(), request.getVideoId());
        String content = aiService.generateInterviewQuestions(text);

        InterviewQuestion iq = new InterviewQuestion();
        iq.setUser(userService.getCurrentUser());
        iq.setDocument(getDocumentIfSet(request.getDocumentId()));
        iq.setYoutubeVideo(getVideoIfSet(request.getVideoId()));
        iq.setContent(content);
        interviewQuestionRepository.save(iq);

        return mapInterviewQuestion(iq);
    }

    // -----------------------------------------------------------------------
    // CHAT — ask a question about document/video content
    // -----------------------------------------------------------------------
    public ChatHistoryDto chat(ChatRequest request) {
        String text = getSourceText(request.getDocumentId(), request.getVideoId());
        String answer = aiService.chat(text, request.getQuestion());

        ChatHistory chat = new ChatHistory();
        chat.setUser(userService.getCurrentUser());
        chat.setDocument(getDocumentIfSet(request.getDocumentId()));
        chat.setYoutubeVideo(getVideoIfSet(request.getVideoId()));
        chat.setQuestion(request.getQuestion());
        chat.setAnswer(answer);
        chatHistoryRepository.save(chat);

        return mapChat(chat);
    }

    // -----------------------------------------------------------------------
    // History getters
    // -----------------------------------------------------------------------
    public List<NoteDto> getMyNotes() {
        Long userId = userService.getCurrentUserId();
        return noteRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapNote).collect(Collectors.toList());
    }

    public List<SummaryDto> getMySummaries() {
        Long userId = userService.getCurrentUserId();
        return summaryRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapSummary).collect(Collectors.toList());
    }

    public List<McqDto> getMyMcqs() {
        Long userId = userService.getCurrentUserId();
        return mcqRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapMcq).collect(Collectors.toList());
    }

    public List<FlashcardDto> getMyFlashcards() {
        Long userId = userService.getCurrentUserId();
        return flashcardRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapFlashcard).collect(Collectors.toList());
    }

    public List<InterviewQuestionDto> getMyInterviewQuestions() {
        Long userId = userService.getCurrentUserId();
        return interviewQuestionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapInterviewQuestion).collect(Collectors.toList());
    }

    public List<ChatHistoryDto> getMyChatHistory() {
        Long userId = userService.getCurrentUserId();
        return chatHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapChat).collect(Collectors.toList());
    }

    public List<ChatHistoryDto> getDocumentChatHistory(Long documentId) {
        return chatHistoryRepository.findByDocumentIdOrderByCreatedAtAsc(documentId)
                .stream().map(this::mapChat).collect(Collectors.toList());
    }

    public List<ChatHistoryDto> getVideoChatHistory(Long videoId) {
        return chatHistoryRepository.findByYoutubeVideoIdOrderByCreatedAtAsc(videoId)
                .stream().map(this::mapChat).collect(Collectors.toList());
    }

    // -----------------------------------------------------------------------
    // Mappers
    // -----------------------------------------------------------------------
    private NoteDto mapNote(Note note) {
        NoteDto dto = new NoteDto();
        dto.setId(note.getId());
        dto.setTitle(note.getTitle());
        dto.setContent(note.getContent());
        dto.setNoteType(note.getNoteType());
        dto.setCreatedAt(note.getCreatedAt());
        if (note.getDocument() != null) dto.setDocumentId(note.getDocument().getId());
        if (note.getYoutubeVideo() != null) dto.setVideoId(note.getYoutubeVideo().getId());
        return dto;
    }

    private SummaryDto mapSummary(Summary s) {
        SummaryDto dto = new SummaryDto();
        dto.setId(s.getId());
        dto.setContent(s.getContent());
        dto.setSummaryType(s.getSummaryType());
        dto.setCreatedAt(s.getCreatedAt());
        if (s.getDocument() != null) dto.setDocumentId(s.getDocument().getId());
        if (s.getYoutubeVideo() != null) dto.setVideoId(s.getYoutubeVideo().getId());
        return dto;
    }

    private McqDto mapMcq(Mcq m) {
        McqDto dto = new McqDto();
        dto.setId(m.getId());
        dto.setContent(m.getContent());
        dto.setCreatedAt(m.getCreatedAt());
        if (m.getDocument() != null) dto.setDocumentId(m.getDocument().getId());
        if (m.getYoutubeVideo() != null) dto.setVideoId(m.getYoutubeVideo().getId());
        return dto;
    }

    private FlashcardDto mapFlashcard(Flashcard f) {
        FlashcardDto dto = new FlashcardDto();
        dto.setId(f.getId());
        dto.setContent(f.getContent());
        dto.setCreatedAt(f.getCreatedAt());
        if (f.getDocument() != null) dto.setDocumentId(f.getDocument().getId());
        if (f.getYoutubeVideo() != null) dto.setVideoId(f.getYoutubeVideo().getId());
        return dto;
    }

    private InterviewQuestionDto mapInterviewQuestion(InterviewQuestion iq) {
        InterviewQuestionDto dto = new InterviewQuestionDto();
        dto.setId(iq.getId());
        dto.setContent(iq.getContent());
        dto.setCreatedAt(iq.getCreatedAt());
        if (iq.getDocument() != null) dto.setDocumentId(iq.getDocument().getId());
        if (iq.getYoutubeVideo() != null) dto.setVideoId(iq.getYoutubeVideo().getId());
        return dto;
    }

    private ChatHistoryDto mapChat(ChatHistory c) {
        ChatHistoryDto dto = new ChatHistoryDto();
        dto.setId(c.getId());
        dto.setQuestion(c.getQuestion());
        dto.setAnswer(c.getAnswer());
        dto.setCreatedAt(c.getCreatedAt());
        if (c.getDocument() != null) dto.setDocumentId(c.getDocument().getId());
        if (c.getYoutubeVideo() != null) dto.setVideoId(c.getYoutubeVideo().getId());
        return dto;
    }
}