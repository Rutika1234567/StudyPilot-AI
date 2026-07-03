package com.studypilot.controller;

import com.studypilot.dto.ApiResponse;
import com.studypilot.dto.DocumentDto;
import com.studypilot.entity.Document;
import com.studypilot.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@Tag(name = "Documents", description = "Upload and manage documents")
@SecurityRequirement(name = "Bearer Authentication")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a document (PDF, DOCX, PPT, PPTX, TXT)")
    public ResponseEntity<ApiResponse<DocumentDto>> uploadDocument(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please select a file to upload"));
        }

        DocumentDto dto = documentService.uploadDocument(file);
        return ResponseEntity.ok(ApiResponse.success("File uploaded and text extracted", dto));
    }

    @GetMapping
    @Operation(summary = "Get all documents for current user")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getMyDocuments() {
        return ResponseEntity.ok(ApiResponse.success(documentService.getMyDocuments()));
    }

    // FIX 5: Changed return type from Document to DocumentDto
    @GetMapping("/{id}")
    @Operation(summary = "Get a specific document with extracted text")
    public ResponseEntity<ApiResponse<DocumentDto>> getDocument(@PathVariable Long id) {
        Document doc = documentService.getDocumentById(id);
        return ResponseEntity.ok(ApiResponse.success(documentService.mapToDtoWithText(doc)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a document")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.success("Document deleted", null));
    }
}