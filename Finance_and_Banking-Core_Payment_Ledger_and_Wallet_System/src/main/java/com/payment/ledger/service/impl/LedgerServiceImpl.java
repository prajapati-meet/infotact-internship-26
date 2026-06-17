package com.payment.ledger.service.impl;

import com.payment.ledger.dto.response.LedgerEntryResponse;
import com.payment.ledger.entity.LedgerEntry;
import com.payment.ledger.entity.User;
import com.payment.ledger.entity.Wallet;
import com.payment.ledger.enums.EntryType;
import com.payment.ledger.repository.LedgerEntryRepository;
import com.payment.ledger.service.interfaces.LedgerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LedgerServiceImpl implements LedgerService {

    private final LedgerEntryRepository ledgerEntryRepository;

    public LedgerServiceImpl(LedgerEntryRepository ledgerEntryRepository) {
        this.ledgerEntryRepository = ledgerEntryRepository;
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void recordEntry(Wallet wallet, User user, EntryType entryType, BigDecimal amount, BigDecimal balanceBefore, BigDecimal balanceAfter, String referenceId, String description) {

        LedgerEntry entry = new LedgerEntry();
        entry.setWallet(wallet);
        entry.setUser(user);
        entry.setEntryType(entryType);
        entry.setAmount(amount);
        entry.setBalanceBefore(balanceBefore);
        entry.setBalanceAfter(balanceAfter);
        entry.setReferenceId(referenceId);
        entry.setDescription(description);

        ledgerEntryRepository.save(entry);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LedgerEntryResponse> getTransactionHistory(UUID walletId) {
        return ledgerEntryRepository
                .findByWalletIdOrderByCreatedAtDesc(walletId)
                .stream()
                .map(entry -> new LedgerEntryResponse(
                        entry.getId(),
                        entry.getEntryType(),
                        entry.getAmount(),
                        entry.getBalanceBefore(),
                        entry.getBalanceAfter(),
                        entry.getReferenceId(),
                        entry.getDescription(),
                        entry.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}