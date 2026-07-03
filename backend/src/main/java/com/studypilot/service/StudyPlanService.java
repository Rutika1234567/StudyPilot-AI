package com.studypilot.service;

import com.studypilot.dto.StudyPlanDto;
import com.studypilot.dto.StudyPlanRequest;
import com.studypilot.entity.StudyPlan;
import com.studypilot.repository.StudyPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudyPlanService {

    @Autowired private StudyPlanRepository studyPlanRepository;
    @Autowired private UserService userService;

    public StudyPlanDto createPlan(StudyPlanRequest request) {
        StudyPlan plan = new StudyPlan();
        plan.setUser(userService.getCurrentUser());
        applyRequest(plan, request);
        studyPlanRepository.save(plan);
        return mapToDto(plan);
    }

    @Transactional(readOnly = true)
    public List<StudyPlanDto> getMyPlans() {
        Long userId = userService.getCurrentUserId();
        return studyPlanRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudyPlanDto getPlanById(Long id) {
        return mapToDto(getOwnedPlan(id));
    }

    public StudyPlanDto updatePlan(Long id, StudyPlanRequest request) {
        StudyPlan plan = getOwnedPlan(id);
        applyRequest(plan, request);
        studyPlanRepository.save(plan);
        return mapToDto(plan);
    }

    public StudyPlanDto updateStatus(Long id, String status) {
        StudyPlan plan = getOwnedPlan(id);
        plan.setStatus(status);
        studyPlanRepository.save(plan);
        return mapToDto(plan);
    }

    public void deletePlan(Long id) {
        StudyPlan plan = getOwnedPlan(id);
        studyPlanRepository.delete(plan);
    }

    // ---- helpers ----

    private StudyPlan getOwnedPlan(Long id) {
        Long userId = userService.getCurrentUserId();
        StudyPlan plan = studyPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Study plan not found: " + id));
        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return plan;
    }

    private void applyRequest(StudyPlan plan, StudyPlanRequest request) {
        if (request.getTitle() != null) plan.setTitle(request.getTitle());
        if (request.getDescription() != null) plan.setDescription(request.getDescription());
        if (request.getStartDate() != null) plan.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) plan.setEndDate(request.getEndDate());
        if (request.getPriority() != null) plan.setPriority(request.getPriority());
        if (request.getStatus() != null) plan.setStatus(request.getStatus());
    }

    public StudyPlanDto mapToDto(StudyPlan p) {
        StudyPlanDto dto = new StudyPlanDto();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setDescription(p.getDescription());
        dto.setStartDate(p.getStartDate());
        dto.setEndDate(p.getEndDate());
        dto.setPriority(p.getPriority());
        dto.setStatus(p.getStatus());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }
}