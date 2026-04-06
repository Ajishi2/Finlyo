package com.finance.controller;

import com.finance.dto.ApiResponse;
import com.finance.dto.FinancialRecordRequest;
import com.finance.dto.FinancialRecordResponse;
import com.finance.entity.TransactionType;
import com.finance.security.SecurityContext;
import com.finance.service.FinancialRecordService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Financial Records Controller
 * Handles operations on financial records: create, read, update, delete
 */
@RestController
@RequestMapping("/api/v1/records")
public class FinancialRecordController {
    private final FinancialRecordService recordService;

    public FinancialRecordController(FinancialRecordService recordService) {
        this.recordService = recordService;
    }

    /**
     * Create a new financial record
     * POST /api/v1/records
     * Allowed: ANALYST, ADMIN
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FinancialRecordResponse>> createRecord(
            @Valid @RequestBody FinancialRecordRequest request) {
        FinancialRecordResponse response = recordService.createRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Financial record created successfully"));
    }

    /**
     * Get all records for the current user with pagination and filtering
     * GET /api/v1/records?page=0&size=10&type=INCOME&category=Food&search=description&startDate=2024-01-01&endDate=2024-12-31&minAmount=100&maxAmount=1000
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<FinancialRecordResponse>>> getRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<FinancialRecordResponse> response = recordService.getRecordsWithFilters(
            pageable, type, category, search, startDate, endDate, minAmount, maxAmount);
        return ResponseEntity.ok(ApiResponse.ok(response, "Records retrieved successfully"));
    }

    /**
     * Get records within a date range
     * GET /api/v1/records/date-range?startDate=2024-01-01&endDate=2024-12-31&page=0&size=10
     */
    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<Page<FinancialRecordResponse>>> getRecordsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FinancialRecordResponse> response = recordService.getRecordsByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response, "Records retrieved successfully"));
    }

    /**
     * Get records filtered by category
     * GET /api/v1/records/category/{category}?page=0&size=10
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<Page<FinancialRecordResponse>>> getRecordsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FinancialRecordResponse> response = recordService.getRecordsByCategory(category, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response, "Records retrieved successfully"));
    }

    /**
     * Get records filtered by type (INCOME or EXPENSE)
     * GET /api/v1/records/type/{type}?page=0&size=10
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<Page<FinancialRecordResponse>>> getRecordsByType(
            @PathVariable TransactionType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FinancialRecordResponse> response = recordService.getRecordsByType(type, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response, "Records retrieved successfully"));
    }

    /**
     * Get a specific record by ID
     * GET /api/v1/records/{recordId}
     */
    @GetMapping("/{recordId}")
    public ResponseEntity<ApiResponse<FinancialRecordResponse>> getRecordById(@PathVariable Long recordId) {
        FinancialRecordResponse response = recordService.getRecordById(recordId);
        return ResponseEntity.ok(ApiResponse.ok(response, "Record retrieved successfully"));
    }

    /**
     * Get recent transactions (last N records)
     * GET /api/v1/records/recent?limit=10
     */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<FinancialRecordResponse>>> getRecentTransactions(
            @RequestParam(defaultValue = "10") int limit) {
        SecurityContext.UserContext currentUser = SecurityContext.getCurrentUser();
        List<FinancialRecordResponse> response = recordService.getRecentRecords(currentUser.getUserId(), limit);
        return ResponseEntity.ok(ApiResponse.ok(response, "Recent transactions retrieved successfully"));
    }

    /**
     * Update a financial record
     * PUT /api/v1/records/{recordId}
     * Analysts can only update their own records, Admins can update any
     */
    @PutMapping("/{recordId}")
    public ResponseEntity<ApiResponse<FinancialRecordResponse>> updateRecord(
            @PathVariable Long recordId,
            @Valid @RequestBody FinancialRecordRequest request) {
        FinancialRecordResponse response = recordService.updateRecord(recordId, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Record updated successfully"));
    }

    /**
     * Delete a financial record (soft delete)
     * DELETE /api/v1/records/{recordId}
     * Analysts can only delete their own records, Admins can delete any
     */
    @DeleteMapping("/{recordId}")
    public ResponseEntity<ApiResponse<Void>> deleteRecord(@PathVariable Long recordId) {
        recordService.deleteRecord(recordId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Record deleted successfully"));
    }
}
