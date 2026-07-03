package com.studypilot.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hslf.usermodel.HSLFSlide;
import org.apache.poi.hslf.usermodel.HSLFSlideShow;
import org.apache.poi.hslf.usermodel.HSLFTextShape;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;

@Component
public class FileParserService {

    private static final Logger logger = LoggerFactory.getLogger(FileParserService.class);

    /**
     * Main entry point — detects file type and routes to correct parser.
     * Supported: PDF, DOCX, DOC, PPTX, PPT, TXT, XLSX, XLS, CSV, MD
     */
    public String extractText(MultipartFile file, String fileType) {
        try {
            return switch (fileType.toUpperCase()) {
                case "PDF"  -> extractFromPdf(file.getInputStream());
                case "DOCX" -> extractFromDocx(file.getInputStream());
                case "DOC"  -> extractFromDoc(file.getInputStream());
                case "PPT"  -> extractFromPpt(file.getInputStream());
                case "PPTX" -> extractFromPptx(file.getInputStream());
                case "TXT"  -> extractFromTxt(file.getInputStream());
                case "MD"   -> extractFromTxt(file.getInputStream());   // Markdown = plain text
                case "XLSX" -> extractFromXlsx(file.getInputStream());
                case "XLS"  -> extractFromXls(file.getInputStream());
                case "CSV"  -> extractFromTxt(file.getInputStream());   // CSV = plain text
                default -> throw new RuntimeException("Unsupported file type: " + fileType);
            };
        } catch (IOException e) {
            logger.error("Failed to extract text from file: {}", e.getMessage());
            throw new RuntimeException("Could not read file: " + e.getMessage());
        }
    }

    // Apache PDFBox
    private String extractFromPdf(InputStream inputStream) throws IOException {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            logger.debug("PDF extracted {} characters", text.length());
            return text;
        }
    }

    // Apache POI — .docx (Word 2007+)
    private String extractFromDocx(InputStream inputStream) throws IOException {
        try (XWPFDocument document = new XWPFDocument(inputStream);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            String text = extractor.getText();
            logger.debug("DOCX extracted {} characters", text.length());
            return text;
        }
    }

    // Apache POI — .doc (Word 97-2003)
    private String extractFromDoc(InputStream inputStream) throws IOException {
        try (HWPFDocument document = new HWPFDocument(inputStream);
             WordExtractor extractor = new WordExtractor(document)) {
            String text = extractor.getText();
            logger.debug("DOC extracted {} characters", text.length());
            return text;
        }
    }

    // Apache POI — .ppt (PowerPoint 97-2003)
    private String extractFromPpt(InputStream inputStream) throws IOException {
        try (HSLFSlideShow slideShow = new HSLFSlideShow(inputStream)) {
            StringBuilder sb = new StringBuilder();
            for (HSLFSlide slide : slideShow.getSlides()) {
                sb.append("--- Slide ").append(slide.getSlideNumber()).append(" ---\n");
                for (HSLFTextShape shape : slide.getTextParagraphs()
                        .stream()
                        .flatMap(p -> p.stream())
                        .map(tp -> tp.getParentShape())
                        .filter(s -> s instanceof HSLFTextShape)
                        .map(s -> (HSLFTextShape) s)
                        .distinct()
                        .toList()) {
                    sb.append(shape.getText()).append("\n");
                }
            }
            return sb.toString();
        }
    }

    // Apache POI — .pptx (PowerPoint 2007+)
    private String extractFromPptx(InputStream inputStream) throws IOException {
        try (XMLSlideShow slideShow = new XMLSlideShow(inputStream)) {
            StringBuilder sb = new StringBuilder();
            int slideNum = 1;
            for (XSLFSlide slide : slideShow.getSlides()) {
                sb.append("--- Slide ").append(slideNum++).append(" ---\n");
                for (XSLFShape shape : slide.getShapes()) {
                    if (shape instanceof XSLFTextShape textShape) {
                        String text = textShape.getText();
                        if (text != null && !text.isBlank()) {
                            sb.append(text).append("\n");
                        }
                    }
                }
            }
            logger.debug("PPTX extracted {} characters", sb.length());
            return sb.toString();
        }
    }

    // Plain text, Markdown, CSV — just read bytes as UTF-8
    private String extractFromTxt(InputStream inputStream) throws IOException {
        String text = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        logger.debug("TXT/MD/CSV extracted {} characters", text.length());
        return text;
    }

    // Apache POI — .xlsx (Excel 2007+)
    private String extractFromXlsx(InputStream inputStream) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            return extractFromWorkbook(workbook);
        }
    }

    // Apache POI — .xls (Excel 97-2003)
    private String extractFromXls(InputStream inputStream) throws IOException {
        try (Workbook workbook = new HSSFWorkbook(inputStream)) {
            return extractFromWorkbook(workbook);
        }
    }

    private String extractFromWorkbook(Workbook workbook) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
            Sheet sheet = workbook.getSheetAt(i);
            sb.append("=== Sheet: ").append(sheet.getSheetName()).append(" ===\n");
            for (Row row : sheet) {
                StringBuilder rowSb = new StringBuilder();
                for (Cell cell : row) {
                    switch (cell.getCellType()) {
                        case STRING  -> rowSb.append(cell.getStringCellValue()).append("\t");
                        case NUMERIC -> rowSb.append(cell.getNumericCellValue()).append("\t");
                        case BOOLEAN -> rowSb.append(cell.getBooleanCellValue()).append("\t");
                        default      -> rowSb.append("\t");
                    }
                }
                String rowStr = rowSb.toString().stripTrailing();
                if (!rowStr.isBlank()) sb.append(rowStr).append("\n");
            }
            sb.append("\n");
        }
        logger.debug("Excel extracted {} characters", sb.length());
        return sb.toString();
    }
}