package com.payment.ledger.service;

import com.payment.ledger.dto.response.LedgerEntryResponse;
import com.payment.ledger.entity.LedgerEntry;
import com.payment.ledger.entity.User;
import com.payment.ledger.entity.Wallet;
import com.payment.ledger.enums.EntryType;
import com.payment.ledger.repository.LedgerEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LedgerServiceImplTest {

    @Mock
    private LedgerEntryRepository ledgerEntryRepository;

    @InjectMocks
    private LedgerServiceImpl ledgerService;

    private Wallet wallet;
    private User user;
    private LedgerEntry entry;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setEmail("user@example.com");

        wallet = new Wallet();
        wallet.setId(UUID.randomUUID());
        wallet.setUser(user);

        entry = new LedgerEntry();
        entry.setId(UUID.randomUUID());
        entry.setWallet(wallet);
        entry.setUser(user);
        entry.setEntryType(EntryType.CREDIT);
        entry.setAmount(new BigDecimal("100"));
        entry.setBalanceBefore(new BigDecimal("500"));
        entry.setBalanceAfter(new BigDecimal("600"));
        entry.setReferenceId("ref-123");
        entry.setDescription("Test Entry");
        entry.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("recordEntry: saves new ledger entry successfully")
    void recordEntry_SavesEntry() {
        // Act
        ledgerService.recordEntry(
                wallet,
                user,
                EntryType.CREDIT,
                new BigDecimal("100"),
                new BigDecimal("500"),
                new BigDecimal("600"),
                "ref-123",
                "Test Entry"
        );

        // Assert
        verify(ledgerEntryRepository).save(any(LedgerEntry.class));
    }

    @Test
    @DisplayName("getTransactionHistory: returns ordered list of mapped ledger entries")
    void getTransactionHistory_ReturnsMappedHistory() {
        // Arrange
        UUID walletId = wallet.getId();
        when(ledgerEntryRepository.findByWalletIdOrderByCreatedAtDesc(walletId))
                .thenReturn(Collections.singletonList(entry));

        // Act
        List<LedgerEntryResponse> history = ledgerService.getTransactionHistory(walletId);

        // Assert
        assertThat(history).hasSize(1);
        LedgerEntryResponse response = history.get(0);
        assertThat(response.getId()).isEqualTo(entry.getId());
        assertThat(response.getEntryType()).isEqualTo(EntryType.CREDIT);
        assertThat(response.getAmount()).isEqualByComparingTo("100");
        assertThat(response.getBalanceBefore()).isEqualByComparingTo("500");
        assertThat(response.getBalanceAfter()).isEqualByComparingTo("600");
        assertThat(response.getReferenceId()).isEqualTo("ref-123");
        assertThat(response.getDescription()).isEqualTo("Test Entry");

        verify(ledgerEntryRepository).findByWalletIdOrderByCreatedAtDesc(walletId);
    }
}
