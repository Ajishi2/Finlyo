package com.finance.dto;

import com.finance.entity.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class FinancialRecordResponse {
    private Long id;
    private Long userId;
    private BigDecimal amount;
    private TransactionType type;
    private String category;
    private LocalDate recordDate;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FinancialRecordResponse() {}

    public FinancialRecordResponse(Long id, Long userId, BigDecimal amount, TransactionType type, String category, LocalDate recordDate, String description, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.recordDate = recordDate;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static FinancialRecordResponseBuilder builder() {
        return new FinancialRecordResponseBuilder();
    }

    public static class FinancialRecordResponseBuilder {
        private Long id;
        private Long userId;
        private BigDecimal amount;
        private TransactionType type;
        private String category;
        private LocalDate recordDate;
        private String description;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public FinancialRecordResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public FinancialRecordResponseBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public FinancialRecordResponseBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public FinancialRecordResponseBuilder type(TransactionType type) {
            this.type = type;
            return this;
        }

        public FinancialRecordResponseBuilder category(String category) {
            this.category = category;
            return this;
        }

        public FinancialRecordResponseBuilder recordDate(LocalDate recordDate) {
            this.recordDate = recordDate;
            return this;
        }

        public FinancialRecordResponseBuilder description(String description) {
            this.description = description;
            return this;
        }

        public FinancialRecordResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public FinancialRecordResponseBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public FinancialRecordResponse build() {
            FinancialRecordResponse response = new FinancialRecordResponse();
            response.id = this.id;
            response.userId = this.userId;
            response.amount = this.amount;
            response.type = this.type;
            response.category = this.category;
            response.recordDate = this.recordDate;
            response.description = this.description;
            response.createdAt = this.createdAt;
            response.updatedAt = this.updatedAt;
            return response;
        }
    }
}
