package com.studypilot.service;

import com.studypilot.dto.DocumentDto;
import com.studypilot.entity.Document;
import com.studypilot.entity.User;
import com.studypilot.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    @Autowired private DocumentRepository documentRepository;
    @Autowired private UserService userService;
    @Autowired private FileParserService fileParserService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    // All supported file types
    private static final List<String> ALLOWED_TYPES = List.of(
            "PDF", "DOCX", "DOC", "PPT", "PPTX", "TXT", "XLSX", "XLS", "CSV", "MD"
    );

    public DocumentDto uploadDocument(MultipartFile file) {
        String originalName = file.getOriginalFilename();
        String fileType = getFileExtension(originalName).toUpperCase();

        validateFileType(fileType);

        String storedFileName = UUID.randomUUID() + "_" + originalName;
        String filePath = saveFileToDisk(file, storedFileName);
        String extractedText = fileParserService.extractText(file, fileType);

        User currentUser = userService.getCurrentUser();
        Document document = new Document();
        document.setUser(currentUser);
        document.setFileName(storedFileName);
        document.setOriginalName(originalName);
        document.setFileType(fileType);
        document.setFileSize(file.getSize());
        document.setFilePath(filePath);
        document.setExtractedText(extractedText);

        document = documentRepository.save(document);
        return mapToDto(document);
    }

    public List<DocumentDto> getMyDocuments() {
        Long userId = userService.getCurrentUserId();
        return documentRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Document getDocumentById(Long documentId) {
        Long userId = userService.getCurrentUserId();
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        if (!document.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return document;
    }

    @Transactional
    public void deleteDocument(Long documentId) {
        Document document = getDocumentById(documentId);
        try {
            Files.deleteIfExists(Paths.get(document.getFilePath()));
        } catch (IOException e) {
            // Log but don't fail — file may already be gone
        }
        documentRepository.delete(document);
    }

    public List<DocumentDto> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public List<String> getSupportedTypes() {
        return ALLOWED_TYPES;
    }

    private String saveFileToDisk(MultipartFile file, String fileName) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return filePath.toString();
        } catch (IOException e) {
            throw new RuntimeException("Could not save file to disk: " + e.getMessage());
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "";
        return fileName.substring(fileName.lastIndexOf('.') + 1);
    }

    private void validateFileType(String fileType) {
        if (!ALLOWED_TYPES.contains(fileType)) {
            throw new RuntimeException("File type not supported: " + fileType +
                    ". Allowed: " + String.join(", ", ALLOWED_TYPES));
        }
    }

    public DocumentDto mapToDto(Document document) {
        DocumentDto dto = new DocumentDto();
        dto.setId(document.getId());
        dto.setFileName(document.getFileName());
        dto.setOriginalName(document.getOriginalName());
        dto.setFileType(document.getFileType());
        dto.setFileSize(document.getFileSize());
        dto.setCreatedAt(document.getCreatedAt());
        return dto;
    }

    public DocumentDto mapToDtoWithText(Document document) {
        DocumentDto dto = mapToDto(document);
        dto.setExtractedText(document.getExtractedText());
        return dto;
    }
}