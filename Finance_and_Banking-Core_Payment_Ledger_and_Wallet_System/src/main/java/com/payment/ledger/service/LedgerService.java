package com.payment.ledger.service;

import com.payment.ledger.dto.response.LedgerEntryResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.entity.Wallet;
import com.payment.ledger.enums.EntryType;

import java.math.BigDecimal;
import java.util.List;

public interface LedgerService {

    void recordEntry(Wallet wallet, User user, EntryType entryType, BigDecimal amount, BigDecimal balanceBefore, BigDecimal balanceAfter, String referenceId, String description);

    List<LedgerEntryResponse> getTransactionHistory(UUID walletId);
}