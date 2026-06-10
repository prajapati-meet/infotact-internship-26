package com.payment.ledger.entity;

import com.payment.ledger.enums.EntryType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "ledger_entries",
        indexes = {
                @Index(name = "idx_ledger_walletId", columnList = "walletId"),
                @Index(name = "idx_ledger_userId", columnList = "userId"),
                @Index(name = "idx_ledger_createdAt", columnList = "createdAt"),
                @Index(name = "idx_ledger_referenceId", columnList = "referenceId")
        }
)
public class LedgerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "walletId", nullable = false, foreignKey = @ForeignKey(name = "fk_ledger_walletId"))
    private Wallet wallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false, foreignKey = @ForeignKey(name = "fk_ledger_userId"))
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name="entryType", nullable = false, length = 10)
    private EntryType entryType;

    @Column(name="amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name="balanceBefore", nullable = false, precision = 19, scale = 4)
    private BigDecimal balanceBefore;

    @Column( name="balanceAfter", nullable = false, precision = 19, scale = 4)
    private BigDecimal balanceAfter;

    @Column(name="referenceId", nullable = false, length = 100)
    private String referenceId;

    @Column(name="description", length = 255)
    private String description;

    @Column(name="createdAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public Wallet getWallet() {
        return wallet;
    }

    public User getUser() {
        return user;
    }

    public EntryType getEntryType() {
        return entryType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public BigDecimal getBalanceBefore() {
        return balanceBefore;
    }

    public BigDecimal getBalanceAfter() {
        return balanceAfter;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setWallet(Wallet wallet) {
        this.wallet = wallet;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setEntryType(EntryType entryType) {
        this.entryType = entryType;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setBalanceBefore(BigDecimal balanceBefore) {
        this.balanceBefore = balanceBefore;
    }

    public void setBalanceAfter(BigDecimal balanceAfter) {
        this.balanceAfter = balanceAfter;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
