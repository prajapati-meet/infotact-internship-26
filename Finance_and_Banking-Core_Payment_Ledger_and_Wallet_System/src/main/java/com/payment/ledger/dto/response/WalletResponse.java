package com.payment.ledger.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.payment.ledger.enums.WalletStatus;

public class WalletResponse {
	
	 private UUID id;
	    private BigDecimal balance;
	    private String currency;
	    private WalletStatus status;
	    private LocalDateTime createdAt;

	    public WalletResponse() {
	    }

	    public WalletResponse(UUID id, BigDecimal balance, String currency,
	                          WalletStatus status, LocalDateTime createdAt) {
	        this.id = id;
	        this.balance = balance;
	        this.currency = currency;
	        this.status = status;
	        this.createdAt = createdAt;
	    }

	    public UUID getId() {
	        return id;
	    }

	    public void setId(UUID id) {
	        this.id = id;
	    }

	    public BigDecimal getBalance() {
	        return balance;
	    }

	    public void setBalance(BigDecimal balance) {
	        this.balance = balance;
	    }

	    public String getCurrency() {
	        return currency;
	    }

	    public void setCurrency(String currency) {
	        this.currency = currency;
	    }

	    public WalletStatus getStatus() {
	        return status;
	    }

	    public void setStatus(WalletStatus status) {
	        this.status = status;
	    }

	    public LocalDateTime getCreatedAt() {
	        return createdAt;
	    }

	    public void setCreatedAt(LocalDateTime createdAt) {
	        this.createdAt = createdAt;
	    }
	}


