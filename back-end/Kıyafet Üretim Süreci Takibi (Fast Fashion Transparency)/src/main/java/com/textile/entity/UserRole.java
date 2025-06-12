package com.textile.entity;

public enum UserRole {
    PRODUCER("Üretici"),
    INSPECTOR("Denetleyici"),
    DISTRIBUTOR("Dağıtıcı"),
    CUSTOMER("Müşteri"),
    ADMIN("Yönetici");

    private final String displayName;

    UserRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 