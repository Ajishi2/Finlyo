package com.finance.controller;

import com.finance.dto.ApiResponse;
import com.finance.dto.CategoryWiseSummaryResponse;
import com.finance.dto.DashboardSummaryResponse;
import com.finance.dto.MonthlySummaryResponse;
import com.finance.service.DashboardService;
import com.finance.repository.FinancialRecordRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Dashboard and Analytics Controller
 * Provides summary-level data for dashboard views
 */
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;
    private final FinancialRecordRepository recordRepository;

    public DashboardController(DashboardService dashboardService, FinancialRecordRepository recordRepository) {
        this.dashboardService = dashboardService;
        this.recordRepository = recordRepository;
    }

    /**
     * Get overall dashboard summary
     * GET /api/v1/dashboard/summary
     * Returns: total income, total expense, net balance, transaction counts
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary() {
        DashboardSummaryResponse response = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.ok(response, "Dashboard summary retrieved successfully"));
    }

    /**
     * Get category-wise breakdown
     * GET /api/v1/dashboard/category-summary
     * Returns: totals and counts by category
     */
    @GetMapping("/category-summary")
    public ResponseEntity<ApiResponse<CategoryWiseSummaryResponse>> getCategoryWiseSummary() {
        CategoryWiseSummaryResponse response = dashboardService.getCategoryWiseSummary();
        return ResponseEntity.ok(ApiResponse.ok(response, "Category summary retrieved successfully"));
    }

    /**
     * Get monthly trends
     * GET /api/v1/dashboard/monthly-summary
     * Returns: income, expense, and net balance by month
     */
    @GetMapping("/monthly-summary")
    public ResponseEntity<ApiResponse<MonthlySummaryResponse>> getMonthlySummary() {
        MonthlySummaryResponse response = dashboardService.getMonthlySummary();
        return ResponseEntity.ok(ApiResponse.ok(response, "Monthly summary retrieved successfully"));
    }

    /**
     * Debug endpoint to check raw database data
     * GET /api/v1/dashboard/debug
     */
    @GetMapping("/debug")
    public ResponseEntity<String> debugData() {
        long totalCount = recordRepository.countAllRecordsByUserId(1L);
        var allRecords = recordRepository.findAllByUserId(1L);
        var filteredRecords = recordRepository.findByUserIdAndDeletedFalseOrderByRecordDateDesc(1L);
        StringBuilder debug = new StringBuilder();
        debug.append("TOTAL COUNT (simple): ").append(totalCount).append(" records\n");
        debug.append("ALL RECORDS (no deleted filter): ").append(allRecords.size()).append(" records\n");
        debug.append("FILTERED RECORDS (deleted=false): ").append(filteredRecords.size()).append(" records\n");
        
        // Also check what user ID is being used
        debug.append("\nCurrent user ID from security context: ");
        try {
            var context = com.finance.security.SecurityContext.getCurrentUser();
            debug.append(context.getUserId()).append("\n");
        } catch (Exception e) {
            debug.append("ERROR: ").append(e.getMessage()).append("\n");
        }
        
        return ResponseEntity.ok(debug.toString());
    }
}
