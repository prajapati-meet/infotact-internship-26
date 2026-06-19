package com.payment;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.payment.ledger.service.LedgerService;
import com.payment.ledger.service.TransferServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.payment.ledger.dto.request.TransferRequest;
import com.payment.ledger.dto.response.TransferResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.entity.Wallet;
import com.payment.ledger.enums.WalletStatus;
import com.payment.ledger.enums.Role;
import org.junit.jupiter.api.DisplayName;
import com.payment.ledger.exception.InsufficientBalanceException;
import com.payment.ledger.exception.InvalidTransferException;
import com.payment.ledger.exception.WalletNotFoundException;
import com.payment.ledger.repository.WalletRepository;

@ExtendWith(MockitoExtension.class)
class TransferServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private LedgerService ledgerService;

    @InjectMocks
    private TransferServiceImpl transferService;

    private User sender;
    private User receiver;

    private Wallet senderWallet;
    private Wallet receiverWallet;

    private TransferRequest request;

    @BeforeEach
    void setUp() {

        sender = new User();
        receiver = new User();

        sender.setId(UUID.randomUUID());
        sender.setUsername("senderUser");
        sender.setRole(Role.USER);

        receiver.setId(UUID.randomUUID());
        receiver.setUsername("receiverUser");
        receiver.setRole(Role.USER);

        sender.setEmail("sender@test.com");
        receiver.setEmail("receiver@test.com");

        senderWallet = new Wallet();
        senderWallet.setId(UUID.randomUUID());
        senderWallet.setUser(sender);
        senderWallet.setBalance(new BigDecimal("500.00"));
        senderWallet.setCurrency("USD");
        senderWallet.setStatus(WalletStatus.ACTIVE);

        receiverWallet = new Wallet();
        receiverWallet.setId(UUID.randomUUID());
        receiverWallet.setUser(receiver);
        receiverWallet.setBalance(new BigDecimal("100.00"));
        receiverWallet.setCurrency("USD");
        receiverWallet.setStatus(WalletStatus.ACTIVE);

        request = new TransferRequest();
        request.setReceiverWalletId(receiverWallet.getId());
        request.setAmount(new BigDecimal("100"));
        request.setDescription("Test Transfer");

        when(walletRepository.save(any(Wallet.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

        doNothing().when(ledgerService).recordEntry(
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            any()
        );
    }

    @Test
    @DisplayName("Transfer should succeed with valid request")
    void transfer_WithValidRequest_ShouldSucceed() {

        when(walletRepository.findByUser(sender))
                .thenReturn(Optional.of(senderWallet));

        UUID firstId = senderWallet.getId().compareTo(receiverWallet.getId()) < 0
                ? senderWallet.getId()
                : receiverWallet.getId();

        UUID secondId = senderWallet.getId().compareTo(receiverWallet.getId()) < 0
                ? receiverWallet.getId()
                : senderWallet.getId();

        when(walletRepository.findByIdWithLock(firstId))
                .thenReturn(Optional.of(firstId.equals(senderWallet.getId()) ? senderWallet : receiverWallet));

        when(walletRepository.findByIdWithLock(secondId))
                .thenReturn(Optional.of(secondId.equals(senderWallet.getId()) ? senderWallet : receiverWallet));

        TransferResponse response =
                transferService.transfer(sender, request);

        assertThat(response).isNotNull();

        assertThat(senderWallet.getBalance())
                .isEqualByComparingTo("400.00");

        assertThat(receiverWallet.getBalance())
                .isEqualByComparingTo("200.00");

        verify(walletRepository, times(2))
                .save(any(Wallet.class));

        verify(ledgerService, times(2))
                .recordEntry(
                        any(),
                        any(),
                        any(),
                        any(),
                        any(),
                        any(),
                        any(),
                        any()
                );
    }

    @Test
    @DisplayName("Transfer should throw exception when balance is insufficient")
    void transfer_WithInsufficientBalance_ShouldThrowException() {

        senderWallet.setBalance(new BigDecimal("50"));

        when(walletRepository.findByUser(sender))
                .thenReturn(Optional.of(senderWallet));

        assertThatThrownBy(() ->
                transferService.transfer(sender, request))
                .isInstanceOf(InsufficientBalanceException.class);

        verify(walletRepository, never()).save(any());
        verifyNoInteractions(ledgerService);
    }

    @Test
    @DisplayName("Transfer should throw exception when transferring to own wallet")
    void transfer_ToOwnWallet_ShouldThrowException() {

        request.setReceiverWalletId(senderWallet.getId());

        when(walletRepository.findByUser(sender))
                .thenReturn(Optional.of(senderWallet));

        assertThatThrownBy(() ->
                transferService.transfer(sender, request))
                .isInstanceOf(InvalidTransferException.class);

        verify(walletRepository, never()).save(any());
        verifyNoInteractions(ledgerService);
    }
    @Test
void transfer_WithZeroAmount_ShouldThrowException() {

    request.setAmount(BigDecimal.ZERO);

    assertThatThrownBy(() ->
            transferService.transfer(sender, request))
            .isInstanceOf(InvalidTransferException.class)
            .hasMessage("Transfer amount must be greater than zero");

    verifyNoInteractions(walletRepository);
    verifyNoInteractions(ledgerService);
}

@Test
void transfer_WhenSenderWalletNotFound_ShouldThrowException() {

    when(walletRepository.findByUser(sender))
            .thenReturn(Optional.empty());

    assertThatThrownBy(() ->
            transferService.transfer(sender, request))
            .isInstanceOf(WalletNotFoundException.class)
            .hasMessageContaining("Sender wallet not found");

    verify(walletRepository).findByUser(sender);
    verify(walletRepository, never()).findByIdWithLock(any());
    verify(walletRepository, never()).save(any());
    verifyNoInteractions(ledgerService);
}

@Test
void transfer_WhenSenderWalletSuspended_ShouldThrowException() {

    senderWallet.setStatus(WalletStatus.SUSPENDED);

    when(walletRepository.findByUser(sender))
            .thenReturn(Optional.of(senderWallet));

    assertThatThrownBy(() ->
            transferService.transfer(sender, request))
            .isInstanceOf(InvalidTransferException.class)
            .hasMessage("Sender wallet is not active");

    verify(walletRepository).findByUser(sender);
    verify(walletRepository, never()).findByIdWithLock(any());
    verify(walletRepository, never()).save(any());
    verifyNoInteractions(ledgerService);
}
}