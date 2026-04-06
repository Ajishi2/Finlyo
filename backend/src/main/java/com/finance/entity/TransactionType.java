package com.finance.entity;

public enum TransactionType {
    INCOME("Money coming in"),
    EXPENSE("Money going out");

    private final String description;

    TransactionType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
