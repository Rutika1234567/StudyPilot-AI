package com.studypilot.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Generates PDFs from AI-generated text content.
 * Uses PDFBox 2.0.31 compatible API (static font fields, not Standard14Fonts).
 */
@Service
public class ExportPdfService {

    private static final float MARGIN       = 50f;
    private static final float PAGE_WIDTH   = PDRectangle.A4.getWidth();
    private static final float PAGE_HEIGHT  = PDRectangle.A4.getHeight();
    private static final float LINE_HEIGHT  = 14f;
    private static final float CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

    public byte[] generatePdf(String title, String contentType, String content) throws IOException {

        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // PDFBox 2.0.x: use static constants (Standard14Fonts is internal/package-private)
            @SuppressWarnings("deprecation")
            PDType1Font titleFont  = PDType1Font.HELVETICA_BOLD;
            @SuppressWarnings("deprecation")
            PDType1Font headerFont = PDType1Font.HELVETICA_BOLD;
            @SuppressWarnings("deprecation")
            PDType1Font bodyFont   = PDType1Font.HELVETICA;
            @SuppressWarnings("deprecation")
            PDType1Font metaFont   = PDType1Font.HELVETICA_OBLIQUE;

            // Build line list with markers
            List<String> lines = new ArrayList<>();
            lines.add("__TITLE__" + (title != null ? title : ""));
            lines.add("__META__Generated: " + LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")));
            lines.add("__META__Type: " + (contentType != null ? contentType : ""));
            lines.add("__META__Platform: StudyPilot AI");
            lines.add("__BLANK__");

            if (content != null) {
                for (String rawLine : content.split("\n")) {
                    if (rawLine.isBlank()) {
                        lines.add("__BLANK__");
                    } else {
                        lines.addAll(wrapLine(rawLine, bodyFont, 10, CONTENT_WIDTH));
                    }
                }
            }

            // Render pages
            float y = PAGE_HEIGHT - MARGIN - 30;
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            PDPageContentStream stream = new PDPageContentStream(document, page);

            for (String line : lines) {
                if (y < MARGIN + LINE_HEIGHT) {
                    stream.close();
                    page = new PDPage(PDRectangle.A4);
                    document.addPage(page);
                    stream = new PDPageContentStream(document, page);
                    y = PAGE_HEIGHT - MARGIN;
                }

                if (line.startsWith("__TITLE__")) {
                    String text = line.substring(9);
                    stream.beginText();
                    stream.setFont(titleFont, 16);
                    stream.newLineAtOffset(MARGIN, y);
                    stream.showText(sanitize(text));
                    stream.endText();
                    y -= 24f;
                    stream.setLineWidth(0.8f);
                    stream.moveTo(MARGIN, y + 6);
                    stream.lineTo(PAGE_WIDTH - MARGIN, y + 6);
                    stream.stroke();
                    y -= 10f;

                } else if (line.startsWith("__META__")) {
                    String text = line.substring(8);
                    stream.beginText();
                    stream.setFont(metaFont, 9);
                    stream.newLineAtOffset(MARGIN, y);
                    stream.showText(sanitize(text));
                    stream.endText();
                    y -= LINE_HEIGHT;

                } else if (line.startsWith("__BLANK__")) {
                    y -= LINE_HEIGHT * 0.6f;

                } else {
                    boolean isHeading = line.matches("^(Q\\d+\\.|#{1,3} |\\d+\\.).*");
                    stream.beginText();
                    stream.setFont(isHeading ? headerFont : bodyFont, isHeading ? 11 : 10);
                    stream.newLineAtOffset(MARGIN, y);
                    stream.showText(sanitize(line));
                    stream.endText();
                    y -= (isHeading ? LINE_HEIGHT + 3 : LINE_HEIGHT);
                }
            }

            stream.close();
            document.save(out);
            return out.toByteArray();
        }
    }

    @SuppressWarnings("deprecation")
    private List<String> wrapLine(String line, PDType1Font font,
                                   float fontSize, float maxWidth) throws IOException {
        List<String> result = new ArrayList<>();
        if (line.isBlank()) { result.add("__BLANK__"); return result; }

        String[] words = line.split(" ");
        StringBuilder current = new StringBuilder();

        for (String word : words) {
            String test = current.isEmpty() ? word : current + " " + word;
            float width;
            try {
                width = font.getStringWidth(sanitize(test)) / 1000f * fontSize;
            } catch (Exception e) {
                width = test.length() * fontSize * 0.5f;
            }
            if (width > maxWidth && !current.isEmpty()) {
                result.add(current.toString());
                current = new StringBuilder(word);
            } else {
                current = new StringBuilder(test);
            }
        }
        if (!current.isEmpty()) result.add(current.toString());
        return result;
    }

    /** Strip non-WinAnsi chars to prevent PDFBox encoding errors */
    private String sanitize(String text) {
        if (text == null) return "";
        return text.replaceAll("[^\\x20-\\x7E]", "?")
                   .replace("\r", "")
                   .replace("\t", "    ");
    }
}