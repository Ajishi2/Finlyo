package com.finance.service;

import com.finance.dto.CategoryWiseSummaryResponse;
import com.finance.dto.DashboardSummaryResponse;
import com.finance.dto.MonthlySummaryResponse;
import com.finance.entity.FinancialRecord;
import com.finance.entity.Role;
import com.finance.exception.ResourceNotFoundException;
import com.finance.repository.FinancialRecordRepository;
import com.finance.repository.UserRepository;
import com.finance.security.AccessControlUtils;
import com.finance.security.SecurityContext;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    private final FinancialRecordRepository recordRepository;
    private final UserRepository userRepository;

    public DashboardService(FinancialRecordRepository recordRepository, UserRepository userRepository) {
        this.recordRepository = recordRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get dashboard summary with total income, expense, and net balance
     */
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary() {
        SecurityContext.UserContext currentUser = SecurityContext.getCurrentUser();
        AccessControlUtils.checkCanViewRecords(Role.valueOf(currentUser.getRole()));

        Long userId = currentUser.getUserId();

        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BigDecimal totalIncome = recordRepository.getTotalIncomeByUserId(userId);
        BigDecimal totalExpense = recordRepository.getTotalExpenseByUserId(userId);

        if (totalIncome == null) totalIncome = BigDecimal.ZERO;
        if (totalExpense == null) totalExpense = BigDecimal.ZERO;

        BigDecimal netBalance = totalIncome.subtract(totalExpense);

        long totalTransactionCount = recordRepository.getRecordCountByUserId(userId);
        long incomeCount = recordRepository.getIncomeCountByUserId(userId);
        long expenseCount = recordRepository.getExpenseCountByUserId(userId);

        return DashboardSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(netBalance)
                .totalTransactions((int) totalTransactionCount)
                .totalIncomeCount((int) incomeCount)
                .totalExpenseCount((int) expenseCount)
                .build();
    }

    /**
     * Get category-wise summary of income and expenses
     */
    @Transactional(readOnly = true)
    public CategoryWiseSummaryResponse getCategoryWiseSummary() {
        SecurityContext.UserContext currentUser = SecurityContext.getCurrentUser();
        AccessControlUtils.checkCanViewRecords(Role.valueOf(currentUser.getRole()));

        Long userId = currentUser.getUserId();

        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Fetch all records for the user
        List<FinancialRecord> records = recordRepository.findByUserIdAndDeletedFalseOrderByRecordDateDesc(userId);

        // Group by category and sum amounts
        Map<String, BigDecimal> categoryTotals = new LinkedHashMap<>();
        Map<String, Integer> categoryTransactionCount = new LinkedHashMap<>();

        for (FinancialRecord record : records) {
            String category = record.getCategory();
            categoryTotals.merge(category, record.getAmount(), BigDecimal::add);
            categoryTransactionCount.merge(category, 1, Integer::sum);
        }

        return CategoryWiseSummaryResponse.builder()
                .categoryTotals(categoryTotals)
                .categoryTransactionCount(categoryTransactionCount)
                .build();
    }

    /**
     * Get monthly summary of income, expense, and net balance
     */
    @Transactional(readOnly = true)
    public MonthlySummaryResponse getMonthlySummary() {
        SecurityContext.UserContext currentUser = SecurityContext.getCurrentUser();
        AccessControlUtils.checkCanViewRecords(Role.valueOf(currentUser.getRole()));

        Long userId = currentUser.getUserId();

        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Fetch all records
        List<FinancialRecord> records = recordRepository.findByUserIdAndDeletedFalseOrderByRecordDateDesc(userId);

        // Group by month
        Map<String, BigDecimal> monthlyIncome = new LinkedHashMap<>();
        Map<String, BigDecimal> monthlyExpense = new LinkedHashMap<>();
        Map<String, BigDecimal> monthlyNetBalance = new LinkedHashMap<>();

        for (FinancialRecord record : records) {
            String monthKey = YearMonth.from(record.getRecordDate()).toString();

            if (record.getType().name().equals("INCOME")) {
                monthlyIncome.merge(monthKey, record.getAmount(), BigDecimal::add);
            } else {
                monthlyExpense.merge(monthKey, record.getAmount(), BigDecimal::add);
            }
        }

        // Calculate net balance for each month
        Set<String> allMonths = new HashSet<>();
        allMonths.addAll(monthlyIncome.keySet());
        allMonths.addAll(monthlyExpense.keySet());

        for (String month : allMonths) {
            BigDecimal income = monthlyIncome.getOrDefault(month, BigDecimal.ZERO);
            BigDecimal expense = monthlyExpense.getOrDefault(month, BigDecimal.ZERO);
            monthlyNetBalance.put(month, income.subtract(expense));
        }

        // Sort by month
        monthlyIncome = monthlyIncome.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new));

        monthlyExpense = monthlyExpense.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new));

        monthlyNetBalance = monthlyNetBalance.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new));

        return MonthlySummaryResponse.builder()
                .monthlyIncome(monthlyIncome)
                .monthlyExpense(monthlyExpense)
                .monthlyNetBalance(monthlyNetBalance)
                .build();
    }
}
