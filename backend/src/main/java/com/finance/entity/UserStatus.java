package com.finance.entity;

public enum UserStatus {
    ACTIVE("User is active"),
    INACTIVE("User is inactive"),
    SUSPENDED("User is suspended");

    private final String description;

    UserStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
