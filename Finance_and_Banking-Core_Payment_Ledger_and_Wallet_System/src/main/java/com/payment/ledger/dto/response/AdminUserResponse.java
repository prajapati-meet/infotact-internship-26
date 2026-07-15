package com.payment.ledger.dto.response;

import com.payment.ledger.enums.AccountStatus;
import java.math.BigDecimal;
import java.util.UUID;

public class AdminUserResponse {
    private UUID id;
    private String username;
    private String email;
    private String profilePhoto;
    private BigDecimal walletBalance;
    private AccountStatus accountStatus;
    private long totalTransactions;
    private boolean enabled;

    public AdminUserResponse() {}

    public AdminUserResponse(UUID id, String username, String email, String profilePhoto,
                             BigDecimal walletBalance, AccountStatus accountStatus,
                             long totalTransactions, boolean enabled) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.profilePhoto = profilePhoto;
        this.walletBalance = walletBalance;
        this.accountStatus = accountStatus;
        this.totalTransactions = totalTransactions;
        this.enabled = enabled;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }

    public BigDecimal getWalletBalance() {
        return walletBalance;
    }

    public void setWalletBalance(BigDecimal walletBalance) {
        this.walletBalance = walletBalance;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(AccountStatus accountStatus) {
        this.accountStatus = accountStatus;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
