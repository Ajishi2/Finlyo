package com.finance.dto;

import java.math.BigDecimal;

public class DashboardSummaryResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netBalance;
    private int totalTransactions;
    private int totalExpenseCount;
    private int totalIncomeCount;

    public DashboardSummaryResponse() {}

    public DashboardSummaryResponse(BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal netBalance, int totalTransactions, int totalExpenseCount, int totalIncomeCount) {
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.netBalance = netBalance;
        this.totalTransactions = totalTransactions;
        this.totalExpenseCount = totalExpenseCount;
        this.totalIncomeCount = totalIncomeCount;
    }

    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }

    public BigDecimal getTotalExpense() { return totalExpense; }
    public void setTotalExpense(BigDecimal totalExpense) { this.totalExpense = totalExpense; }

    public BigDecimal getNetBalance() { return netBalance; }
    public void setNetBalance(BigDecimal netBalance) { this.netBalance = netBalance; }

    public int getTotalTransactions() { return totalTransactions; }
    public void setTotalTransactions(int totalTransactions) { this.totalTransactions = totalTransactions; }

    public int getTotalExpenseCount() { return totalExpenseCount; }
    public void setTotalExpenseCount(int totalExpenseCount) { this.totalExpenseCount = totalExpenseCount; }

    public int getTotalIncomeCount() { return totalIncomeCount; }
    public void setTotalIncomeCount(int totalIncomeCount) { this.totalIncomeCount = totalIncomeCount; }

    public static DashboardSummaryResponseBuilder builder() {
        return new DashboardSummaryResponseBuilder();
    }

    public static class DashboardSummaryResponseBuilder {
        private BigDecimal totalIncome;
        private BigDecimal totalExpense;
        private BigDecimal netBalance;
        private int totalTransactions;
        private int totalExpenseCount;
        private int totalIncomeCount;

        public DashboardSummaryResponseBuilder totalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; return this; }
        public DashboardSummaryResponseBuilder totalExpense(BigDecimal totalExpense) { this.totalExpense = totalExpense; return this; }
        public DashboardSummaryResponseBuilder netBalance(BigDecimal netBalance) { this.netBalance = netBalance; return this; }
        public DashboardSummaryResponseBuilder totalTransactions(int totalTransactions) { this.totalTransactions = totalTransactions; return this; }
        public DashboardSummaryResponseBuilder totalExpenseCount(int totalExpenseCount) { this.totalExpenseCount = totalExpenseCount; return this; }
        public DashboardSummaryResponseBuilder totalIncomeCount(int totalIncomeCount) { this.totalIncomeCount = totalIncomeCount; return this; }

        public DashboardSummaryResponse build() {
            DashboardSummaryResponse response = new DashboardSummaryResponse();
            response.totalIncome = this.totalIncome;
            response.totalExpense = this.totalExpense;
            response.netBalance = this.netBalance;
            response.totalTransactions = this.totalTransactions;
            response.totalExpenseCount = this.totalExpenseCount;
            response.totalIncomeCount = this.totalIncomeCount;
            return response;
        }
    }
}
