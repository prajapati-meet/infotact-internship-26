package com.payment.ledger.dto.response;

public class AdminStatsResponse {
    private long totalUsers;
    private long activeUsers;
    private long disabledUsers;
    private long totalTransactions;

    public AdminStatsResponse() {}

    public AdminStatsResponse(long totalUsers, long activeUsers, long disabledUsers, long totalTransactions) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.disabledUsers = disabledUsers;
        this.totalTransactions = totalTransactions;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getDisabledUsers() {
        return disabledUsers;
    }

    public void setDisabledUsers(long disabledUsers) {
        this.disabledUsers = disabledUsers;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }
}
