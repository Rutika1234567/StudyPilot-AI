package com.studypilot.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    private final ChatClient chatClient;

    public AiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String generate(String prompt) {
        try {
            logger.debug("Sending prompt to Ollama ({} chars)", prompt.length());
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
            logger.debug("Ollama responded ({} chars)", response.length());
            return response;
        } catch (Exception e) {
            logger.error("Ollama error", e);
            throw new RuntimeException(
                    "AI generation failed. Make sure Ollama is running (ollama serve). "
                            + e.getMessage(), e);
        }
    }

    public String generateSummary(String content) {
        String prompt = """
                You are an expert academic tutor.
                Create a detailed summary of the following content.

                Content:
                %s

                Summary:
                """.formatted(truncate(content, 3000));
        return generate(prompt);
    }

    public String generateShortNotes(String content) {
        String prompt = """
                Create concise bullet-point notes.

                Content:
                %s

                Notes:
                """.formatted(truncate(content, 3000));
        return generate(prompt);
    }

    public String generateChapterWiseNotes(String content) {
        String prompt = """
                Organize this content into chapters with headings and key points.

                Content:
                %s

                Chapter Notes:
                """.formatted(truncate(content, 4000));
        return generate(prompt);
    }

    public String generateMcqs(String content) {
        String prompt = """
                Generate exactly 10 multiple-choice questions from the following content.
                
                Use this EXACT format for each question (no deviations):
                Q1. [Question text]
                A) [Option A]
                B) [Option B]
                C) [Option C]
                D) [Option D]
                Answer: A
                
                Q2. [Question text]
                A) [Option A]
                B) [Option B]
                C) [Option C]
                D) [Option D]
                Answer: B
                
                (continue for Q3 through Q10)
                
                Content:
                %s
                
                MCQs:
                """.formatted(truncate(content, 3000));
        return generate(prompt);
    }

    public String generateInterviewQuestions(String content) {
        String prompt = """
                Generate 10 interview questions and detailed answers.

                Content:
                %s

                Interview Questions:
                """.formatted(truncate(content, 3000));
        return generate(prompt);
    }

    public String generateFlashcards(String content) {
        String prompt = """
                Generate 10 flashcards.

                Content:
                %s

                Flashcards:
                """.formatted(truncate(content, 3000));
        return generate(prompt);
    }

    public String generateVivaQuestions(String content) {
        String prompt = """
                Generate 10 viva questions with answers.

                Content:
                %s

                Viva Questions:
                """.formatted(truncate(content, 3000));
        return generate(prompt);
    }

    public String generateImportantTopics(String content) {
        String prompt = """
                Identify the most important topics and rank them.

                Content:
                %s

                Important Topics:
                """.formatted(truncate(content, 3000));
        return generate(prompt);
    }

    // NEW: Generate important exam questions
    public String generateImportantQuestions(String content) {
        String prompt = """
                You are an expert exam coach.
                From the following content, generate 15 important exam questions that students must prepare.
                Include a mix of:
                - Short answer questions (2 marks)
                - Long answer questions (5 marks)
                - Application/scenario questions (10 marks)
                
                Format each question as:
                Q1. [Question] (2 marks)
                Q2. [Question] (5 marks)
                ... and so on.
                
                Content:
                %s
                
                Important Questions:
                """.formatted(truncate(content, 3000));
        return generate(prompt);
    }

    public String chat(String content, String question) {
        String prompt = """
                Answer ONLY from the supplied content.

                Content:
                %s

                Question:
                %s

                Answer:
                """.formatted(truncate(content, 3000), question);
        return generate(prompt);
    }

    private String truncate(String text, int maxChars) {
        if (text == null) return "";
        if (text.length() <= maxChars) return text;
        return text.substring(0, maxChars) + "\n\n[Content truncated]";
    }
}