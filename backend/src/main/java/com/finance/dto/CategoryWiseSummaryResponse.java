package com.finance.dto;

import java.math.BigDecimal;
import java.util.Map;

public class CategoryWiseSummaryResponse {
    private Map<String, BigDecimal> categoryTotals;
    private Map<String, Integer> categoryTransactionCount;

    public CategoryWiseSummaryResponse() {}

    public CategoryWiseSummaryResponse(Map<String, BigDecimal> categoryTotals, Map<String, Integer> categoryTransactionCount) {
        this.categoryTotals = categoryTotals;
        this.categoryTransactionCount = categoryTransactionCount;
    }

    public Map<String, BigDecimal> getCategoryTotals() { return categoryTotals; }
    public void setCategoryTotals(Map<String, BigDecimal> categoryTotals) { this.categoryTotals = categoryTotals; }

    public Map<String, Integer> getCategoryTransactionCount() { return categoryTransactionCount; }
    public void setCategoryTransactionCount(Map<String, Integer> categoryTransactionCount) { this.categoryTransactionCount = categoryTransactionCount; }

    public static CategoryWiseSummaryResponseBuilder builder() {
        return new CategoryWiseSummaryResponseBuilder();
    }

    public static class CategoryWiseSummaryResponseBuilder {
        private Map<String, BigDecimal> categoryTotals;
        private Map<String, Integer> categoryTransactionCount;

        public CategoryWiseSummaryResponseBuilder categoryTotals(Map<String, BigDecimal> categoryTotals) { this.categoryTotals = categoryTotals; return this; }
        public CategoryWiseSummaryResponseBuilder categoryTransactionCount(Map<String, Integer> categoryTransactionCount) { this.categoryTransactionCount = categoryTransactionCount; return this; }

        public CategoryWiseSummaryResponse build() {
            CategoryWiseSummaryResponse response = new CategoryWiseSummaryResponse();
            response.categoryTotals = this.categoryTotals;
            response.categoryTransactionCount = this.categoryTransactionCount;
            return response;
        }
    }
}
