package com.payment.ledger.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class TransferResponse {

    private String referenceId;
    private UUID senderWalletId;
    private UUID receiverWalletId;
    private BigDecimal amount;
    private BigDecimal senderBalanceAfter;
    private String description;
    private LocalDateTime timestamp;

    public TransferResponse() {
    }

    public TransferResponse(String referenceId,
                            UUID senderWalletId,
                            UUID receiverWalletId,
                            BigDecimal amount,
                            BigDecimal senderBalanceAfter,
                            String description,
                            LocalDateTime timestamp) {
        this.referenceId = referenceId;
        this.senderWalletId = senderWalletId;
        this.receiverWalletId = receiverWalletId;
        this.amount = amount;
        this.senderBalanceAfter = senderBalanceAfter;
        this.description = description;
        this.timestamp = timestamp;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public UUID getSenderWalletId() {
        return senderWalletId;
    }

    public void setSenderWalletId(UUID senderWalletId) {
        this.senderWalletId = senderWalletId;
    }

    public UUID getReceiverWalletId() {
        return receiverWalletId;
    }

    public void setReceiverWalletId(UUID receiverWalletId) {
        this.receiverWalletId = receiverWalletId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getSenderBalanceAfter() {
        return senderBalanceAfter;
    }

    public void setSenderBalanceAfter(BigDecimal senderBalanceAfter) {
        this.senderBalanceAfter = senderBalanceAfter;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}