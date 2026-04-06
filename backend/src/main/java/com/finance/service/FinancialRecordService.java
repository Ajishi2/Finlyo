package com.finance.service;

import com.finance.dto.*;
import com.finance.entity.FinancialRecord;
import com.finance.entity.Role;
import com.finance.entity.TransactionType;
import com.finance.exception.AccessDeniedException;
import com.finance.exception.ResourceNotFoundException;
import com.finance.repository.FinancialRecordRepository;
import com.finance.repository.UserRepository;
import com.finance.security.AccessControlUtils;
import com.finance.security.SecurityContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FinancialRecordService {
    private final FinancialRecordRepository recordRepository;
    private final UserRepository userRepository;

    public FinancialRecordService(FinancialRecordRepository recordRepository, UserRepository userRepository) {
        this.recordRepository = recordRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new financial record (ANALYST, ADMIN)
     */
    @Transactional
    public FinancialRecordResponse createRecord(FinancialRecordRequest request) {
        SecurityContext.UserContext currentUser = SecurityContext.getCurrentUser();
        AccessControlUtils.checkCanCreateRecord(Role.valueOf(currentUser.getRole()));

        var user = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        FinancialRecord record = FinancialRecord.builder()
                .user(user)
                .amount(request.getAmount())
                .type(request.getType())
                .category(request.getCategory())
                .recordDate(request.getRecordDate())
                .description(request.getDescription())
                .deleted(false)
                .build();

        record = recordRepository.save(record);
        return mapToResponse(record, currentUser.getUserId());
    }

    /**
     * Get all records for the authenticated user with pagination and filtering
     * Viewers see only summaries, Analysts see their records, Admins see all
     */
    @Transactional(readOnly = true)
    public Page<FinancialRecordResponse> getRecords(Pageable pageable) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                throw new RuntimeException("No authentication found");
            }
            
            // Get user details from SecurityContext
            SecurityContext.UserContext currentUser = SecurityContext.getCurrentUser();
            if (currentUser == null) {
                throw new RuntimeException("No user context found");
            }
            
            Long userId = currentUser.getUserId();
            Role role = Role.valueOf(currentUser.getRole());
            
            AccessControlUtils.checkCanViewRecords(role);
            
            // For analysts, they only see their own records
            Page<FinancialRecord> records = recordRepository.findByUserIdAndDeletedFalseOrderByRecordDateDesc(userId, pageable);
            
            // Cache the user context to avoid calling SecurityContext for every record
            final Long currentUserId = userId;
            return records.map(record -> mapToResponse(record, currentUserId));
        } catch (Exception e) {
            throw e; // Re-throw to trigger the global exception handler
        }
    }

    /**
     * Get records with multiple filters
     */
    @Transactional(readOnly = true)
    public Page<FinancialRecordResponse> getRecordsWithFilters(
            Pageable pageable, String type, String category, String search,
            LocalDate startDate, LocalDate endDate, Double minAmount, Double maxAmount) {
        
        SecurityContext.UserContext currentUser = SecurityContext.getCurrentUser();
        AccessControlUtils.checkCanViewRecords(Role.valueOf(currentUser.getRole()));

        Long userId = currentUser.getUserId();
        
        // Convert empty strings to null to avoid PostgreSQL issues
        if (search != null && search.isBlank()) {
            search = null;
        }
        if (category != null && category.isBlank()) {
            category = null;
        }
        if (type != null && type.isBlank()) {
            type = null;
        }
        
        // Convert string type to TransactionType enum if provided
        TransactionType transactionType = null;
        if (type != null && !type.trim().isEmpty()) {
            try {
                transactionType = TransactionType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid type, treat as null (no filtering)
                transactionType = null;
            }
        }
        
        // Build dynamic query based on provided filters
        Page<FinancialRecord> records = recordRepository.findWithFilters(
                userId, transactionType, category, search, startDate, endDate, minAmount, maxAmount, pageable);

        return records.map(record -> mapToResponse(record, userId));
    }

    /**
     * Get records with date range filter
     */
    @Transactional(readOnly = true)
    public Page<FinancialRecordResponse> getRecordsByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        SecurityContext.UserContext currentUser = SecurityContext.getCurrentUser();
        AccessControlUtils.checkCanViewRecords(Role.valueOf(currentUser.getRole()));

        Long userId = currentUser.getUserId();
        Page<FinancialRecord> records = recordRepository.findByUserIdAndDeletedFalseAndRecordDateBetweenOrderByRecordDateDesc(
                userId, startDate, endDate, pageable);

        return records.map(record -> mapToResponse(record, userId));
    }

    /**
     * Get records filtered by category
     */
    @Transactional(readOnly = true)
    public Page<FinancialRecordResponse> getRecordsByCategory(String category, Pageable pageable) {
        SecurityContext.UserContext currentUser = SecurityContext.getCurrentUser();
        AccessControlUtils.checkCanViewRecords(Role.valueOf(currentUser.getRole()));

        Long userId = currentUser.getUserId();
        Page<FinancialRecord> records = recordRepository.findByUserIdAndDeletedFalseAndCategoryOrderByRecordDateDesc(
                userId, category, pageable);

        return records.map(record -> mapToResponse(record, userId));
    }

    /**
     * Get records filtered by type (INCOME or EXPENSE)
     */
    @Transactional(readOnly = true)
    public Page<FinancialRecordResponse> getRecordsByType(TransactionType type, Pageable pageable) {
        SecurityContext.UserContext currentUser = SecurityContext.getCurrentUser();
        AccessControlUtils.checkCanViewRecords(Role.valueOf(currentUser.getRole()));

        Long userId = currentUser.getUserId();
        Page<FinancialRecord> records = recordRepository.findByUserIdAndDeletedFalseAndTypeOrderByRecordDateDesc(
                userId, type, pageable);

        return records.map(record -> mapToResponse(record, userId));
    }

    /**
     * Get a specific record by ID
     */
    @Transactional(readOnly = true)
    public FinancialRecordResponse getRecordById(Long recordId) {
        SecurityContext.UserContext currentUser = SecurityContext.getCurrentUser();
        AccessControlUtils.checkCanViewRecords(Role.valueOf(currentUser.getRole()));

        FinancialRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Record with ID " + recordId + " not found"));

        // Check access: analysts can only view their own records
        if (Role.valueOf(currentUser.getRole()) == Role.ANALYST && !record.getUser().getId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("You can only view your own records");
        }

        return mapToResponse(record, currentUser.getUserId());
    }

    /**
     * Update a financial record (ANALYST - own only, ADMIN - any)
     */
    @Transactional
    public FinancialRecordResponse updateRecord(Long recordId, FinancialRecordRequest request) {
        SecurityContext.UserContext currentUser = SecurityContext.getCurrentUser();
        AccessControlUtils.checkCanUpdateRecord(Role.valueOf(currentUser.getRole()), recordId, currentUser.getUserId());

        FinancialRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Record with ID " + recordId + " not found"));

        // Check permission
        AccessControlUtils.checkCanUpdateRecord(Role.valueOf(currentUser.getRole()), record.getUser().getId(), currentUser.getUserId());

        if (request.getAmount() != null) {
            record.setAmount(request.getAmount());
        }
        if (request.getType() != null) {
            record.setType(request.getType());
        }
        if (request.getCategory() != null) {
            record.setCategory(request.getCategory());
        }
        if (request.getRecordDate() != null) {
            record.setRecordDate(request.getRecordDate());
        }
        if (request.getDescription() != null) {
            record.setDescription(request.getDescription());
        }

        record = recordRepository.save(record);
        return mapToResponse(record, currentUser.getUserId());
    }

    /**
     * Delete a record (ANALYST - own only, ADMIN - any, soft delete)
     */
    @Transactional
    public void deleteRecord(Long recordId) {
        SecurityContext.UserContext currentUser = SecurityContext.getCurrentUser();

        FinancialRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Record with ID " + recordId + " not found"));

        // Check permission
        AccessControlUtils.checkCanDeleteRecord(Role.valueOf(currentUser.getRole()), record.getUser().getId(), currentUser.getUserId());

        record.softDelete();
        recordRepository.save(record);
    }

    /**
     * Get recent transactions (last N records)
     */
    @Transactional(readOnly = true)
    public List<FinancialRecordResponse> getRecentRecords(Long userId, int limit) {
        List<FinancialRecord> records = recordRepository.findByUserIdAndDeletedFalseOrderByRecordDateDesc(userId);
        
        return records.stream()
                .limit(limit)
                .map(record -> mapToResponse(record, userId))
                .collect(Collectors.toList());
    }

    /**
     * Map FinancialRecord entity to response DTO
     */
    private FinancialRecordResponse mapToResponse(FinancialRecord record, Long userId) {
        return FinancialRecordResponse.builder()
                .id(record.getId())
                .userId(userId)  // Use userId from parameter
                .amount(record.getAmount())
                .type(record.getType())
                .category(record.getCategory())
                .recordDate(record.getRecordDate())
                .description(record.getDescription())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}
