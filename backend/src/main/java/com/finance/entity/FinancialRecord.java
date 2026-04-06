package com.finance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_records", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_record_date", columnList = "record_date"),
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_deleted", columnList = "deleted")
})
public class FinancialRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @NotNull(message = "Transaction type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    private String category;

    @NotNull(message = "Record date is required")
    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(nullable = false)
    private boolean deleted = false;

    // Constructors
    public FinancialRecord() {}

    public FinancialRecord(Long id, User user, BigDecimal amount, TransactionType type, String category, LocalDate recordDate, String description, LocalDateTime createdAt, LocalDateTime updatedAt, boolean deleted) {
        this.id = id;
        this.user = user;
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.recordDate = recordDate;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deleted = deleted;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public TransactionType getType() {
        return type;
    }

    public String getCategory() {
        return category;
    }

    public LocalDate getRecordDate() {
        return recordDate;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public boolean isDeleted() {
        return deleted;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setRecordDate(LocalDate recordDate) {
        this.recordDate = recordDate;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    // Builder Pattern
    public static FinancialRecordBuilder builder() {
        return new FinancialRecordBuilder();
    }

    public static class FinancialRecordBuilder {
        private Long id;
        private User user;
        private BigDecimal amount;
        private TransactionType type;
        private String category;
        private LocalDate recordDate;
        private String description;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private boolean deleted = false;

        public FinancialRecordBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public FinancialRecordBuilder user(User user) {
            this.user = user;
            return this;
        }

        public FinancialRecordBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public FinancialRecordBuilder type(TransactionType type) {
            this.type = type;
            return this;
        }

        public FinancialRecordBuilder category(String category) {
            this.category = category;
            return this;
        }

        public FinancialRecordBuilder recordDate(LocalDate recordDate) {
            this.recordDate = recordDate;
            return this;
        }

        public FinancialRecordBuilder description(String description) {
            this.description = description;
            return this;
        }

        public FinancialRecordBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public FinancialRecordBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public FinancialRecordBuilder deleted(boolean deleted) {
            this.deleted = deleted;
            return this;
        }

        public FinancialRecord build() {
            FinancialRecord record = new FinancialRecord();
            record.id = this.id;
            record.user = this.user;
            record.amount = this.amount;
            record.type = this.type;
            record.category = this.category;
            record.recordDate = this.recordDate;
            record.description = this.description;
            record.createdAt = this.createdAt != null ? this.createdAt : LocalDateTime.now();
            record.updatedAt = this.updatedAt != null ? this.updatedAt : LocalDateTime.now();
            record.deleted = this.deleted;
            return record;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void softDelete() {
        deleted = true;
        updatedAt = LocalDateTime.now();
    }
}
