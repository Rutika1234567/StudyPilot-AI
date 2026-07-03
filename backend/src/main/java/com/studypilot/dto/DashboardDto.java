package com.studypilot.dto;

import java.util.List;

public class DashboardDto {

    private long totalDocuments;
    private long totalVideos;
    private long totalNotes;
    private long totalChats;
    private List<DocumentDto> recentDocuments;
    private List<YoutubeVideoDto> recentVideos;

    private long totalFavorites;
    private long totalImportantQuestions;

    private long totalQuizAttempts;
    private double averageQuizScore;
    private int bestQuizScore;

    private long totalStudyPlans;
    private long completedStudyPlans;
    private long pendingStudyPlans;

    public DashboardDto() {}

    public long getTotalDocuments() {
        return totalDocuments;
    }

    public void setTotalDocuments(long totalDocuments) {
        this.totalDocuments = totalDocuments;
    }

    public long getTotalVideos() {
        return totalVideos;
    }

    public void setTotalVideos(long totalVideos) {
        this.totalVideos = totalVideos;
    }

    public long getTotalNotes() {
        return totalNotes;
    }

    public void setTotalNotes(long totalNotes) {
        this.totalNotes = totalNotes;
    }

    public long getTotalChats() {
        return totalChats;
    }

    public void setTotalChats(long totalChats) {
        this.totalChats = totalChats;
    }

    public List<DocumentDto> getRecentDocuments() {
        return recentDocuments;
    }

    public void setRecentDocuments(List<DocumentDto> recentDocuments) {
        this.recentDocuments = recentDocuments;
    }

    public List<YoutubeVideoDto> getRecentVideos() {
        return recentVideos;
    }

    public void setRecentVideos(List<YoutubeVideoDto> recentVideos) {
        this.recentVideos = recentVideos;
    }

    public long getTotalFavorites() {
        return totalFavorites;
    }

    public void setTotalFavorites(long totalFavorites) {
        this.totalFavorites = totalFavorites;
    }

    public long getTotalImportantQuestions() {
        return totalImportantQuestions;
    }

    public void setTotalImportantQuestions(long totalImportantQuestions) {
        this.totalImportantQuestions = totalImportantQuestions;
    }

    public long getTotalQuizAttempts() {
        return totalQuizAttempts;
    }

    public void setTotalQuizAttempts(long totalQuizAttempts) {
        this.totalQuizAttempts = totalQuizAttempts;
    }

    public double getAverageQuizScore() {
        return averageQuizScore;
    }

    public void setAverageQuizScore(double averageQuizScore) {
        this.averageQuizScore = averageQuizScore;
    }

    public int getBestQuizScore() {
        return bestQuizScore;
    }

    public void setBestQuizScore(int bestQuizScore) {
        this.bestQuizScore = bestQuizScore;
    }

    public long getTotalStudyPlans() {
        return totalStudyPlans;
    }

    public void setTotalStudyPlans(long totalStudyPlans) {
        this.totalStudyPlans = totalStudyPlans;
    }

    public long getCompletedStudyPlans() {
        return completedStudyPlans;
    }

    public void setCompletedStudyPlans(long completedStudyPlans) {
        this.completedStudyPlans = completedStudyPlans;
    }

    public long getPendingStudyPlans() {
        return pendingStudyPlans;
    }

    public void setPendingStudyPlans(long pendingStudyPlans) {
        this.pendingStudyPlans = pendingStudyPlans;
    }
}