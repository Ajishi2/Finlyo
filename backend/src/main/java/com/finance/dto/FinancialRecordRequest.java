package com.finance.dto;

import com.finance.entity.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public class FinancialRecordRequest {
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Record date is required")
    private LocalDate recordDate;

    private String description;

    public FinancialRecordRequest() {}

    public FinancialRecordRequest(BigDecimal amount, TransactionType type, String category, LocalDate recordDate, String description) {
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.recordDate = recordDate;
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDate getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(LocalDate recordDate) {
        this.recordDate = recordDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public static FinancialRecordRequestBuilder builder() {
        return new FinancialRecordRequestBuilder();
    }

    public static class FinancialRecordRequestBuilder {
        private BigDecimal amount;
        private TransactionType type;
        private String category;
        private LocalDate recordDate;
        private String description;

        public FinancialRecordRequestBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public FinancialRecordRequestBuilder type(TransactionType type) {
            this.type = type;
            return this;
        }

        public FinancialRecordRequestBuilder category(String category) {
            this.category = category;
            return this;
        }

        public FinancialRecordRequestBuilder recordDate(LocalDate recordDate) {
            this.recordDate = recordDate;
            return this;
        }

        public FinancialRecordRequestBuilder description(String description) {
            this.description = description;
            return this;
        }

        public FinancialRecordRequest build() {
            FinancialRecordRequest request = new FinancialRecordRequest();
            request.amount = this.amount;
            request.type = this.type;
            request.category = this.category;
            request.recordDate = this.recordDate;
            request.description = this.description;
            return request;
        }
    }
}
