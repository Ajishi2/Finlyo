package com.finance.dto;

import java.math.BigDecimal;
import java.util.Map;

public class MonthlySummaryResponse {
    private Map<String, BigDecimal> monthlyIncome;
    private Map<String, BigDecimal> monthlyExpense;
    private Map<String, BigDecimal> monthlyNetBalance;

    public MonthlySummaryResponse() {}

    public MonthlySummaryResponse(Map<String, BigDecimal> monthlyIncome, Map<String, BigDecimal> monthlyExpense, Map<String, BigDecimal> monthlyNetBalance) {
        this.monthlyIncome = monthlyIncome;
        this.monthlyExpense = monthlyExpense;
        this.monthlyNetBalance = monthlyNetBalance;
    }

    public Map<String, BigDecimal> getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(Map<String, BigDecimal> monthlyIncome) { this.monthlyIncome = monthlyIncome; }

    public Map<String, BigDecimal> getMonthlyExpense() { return monthlyExpense; }
    public void setMonthlyExpense(Map<String, BigDecimal> monthlyExpense) { this.monthlyExpense = monthlyExpense; }

    public Map<String, BigDecimal> getMonthlyNetBalance() { return monthlyNetBalance; }
    public void setMonthlyNetBalance(Map<String, BigDecimal> monthlyNetBalance) { this.monthlyNetBalance = monthlyNetBalance; }

    public static MonthlySummaryResponseBuilder builder() {
        return new MonthlySummaryResponseBuilder();
    }

    public static class MonthlySummaryResponseBuilder {
        private Map<String, BigDecimal> monthlyIncome;
        private Map<String, BigDecimal> monthlyExpense;
        private Map<String, BigDecimal> monthlyNetBalance;

        public MonthlySummaryResponseBuilder monthlyIncome(Map<String, BigDecimal> monthlyIncome) { this.monthlyIncome = monthlyIncome; return this; }
        public MonthlySummaryResponseBuilder monthlyExpense(Map<String, BigDecimal> monthlyExpense) { this.monthlyExpense = monthlyExpense; return this; }
        public MonthlySummaryResponseBuilder monthlyNetBalance(Map<String, BigDecimal> monthlyNetBalance) { this.monthlyNetBalance = monthlyNetBalance; return this; }

        public MonthlySummaryResponse build() {
            MonthlySummaryResponse response = new MonthlySummaryResponse();
            response.monthlyIncome = this.monthlyIncome;
            response.monthlyExpense = this.monthlyExpense;
            response.monthlyNetBalance = this.monthlyNetBalance;
            return response;
        }
    }
}
