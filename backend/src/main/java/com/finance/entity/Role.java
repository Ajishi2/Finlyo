package com.finance.entity;

public enum Role {
    VIEWER("Can only view dashboard data"),
    ANALYST("Can view records and access insights"),
    ADMIN("Can create, update, manage records and users");

    private final String description;

    Role(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
