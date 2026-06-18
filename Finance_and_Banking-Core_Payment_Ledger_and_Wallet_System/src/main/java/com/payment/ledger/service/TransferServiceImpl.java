package com.payment.ledger.service;

import com.payment.ledger.dto.request.DepositRequest;
import com.payment.ledger.dto.request.TransferRequest;
import com.payment.ledger.dto.request.WithdrawRequest;
import com.payment.ledger.dto.response.LedgerEntryResponse;
import com.payment.ledger.dto.response.TransferResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.entity.Wallet;
import com.payment.ledger.enums.EntryType;
import com.payment.ledger.enums.WalletStatus;
import com.payment.ledger.exception.InsufficientBalanceException;
import com.payment.ledger.exception.InvalidTransferException;
import com.payment.ledger.exception.WalletNotFoundException;
import com.payment.ledger.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TransferServiceImpl implements TransferService {

    private final WalletRepository walletRepository;
    private final LedgerService ledgerService;

    public TransferServiceImpl(WalletRepository walletRepository,
                               LedgerService ledgerService) {
        this.walletRepository = walletRepository;
        this.ledgerService = ledgerService;
    }

    @Override
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public TransferResponse transfer(User sender, TransferRequest request) {

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTransferException("Transfer amount must be greater than zero");
        }

        Wallet senderWallet = walletRepository.findByUser(sender)
                .orElseThrow(() -> new WalletNotFoundException(
                        "Sender wallet not found for user: " + sender.getEmail()));

        if (senderWallet.getStatus() != WalletStatus.ACTIVE) {
            throw new InvalidTransferException("Sender wallet is not active");
        }

        if (senderWallet.getId().equals(request.getReceiverWalletId())) {
            throw new InvalidTransferException("Cannot transfer to your own wallet");
        }

        if (senderWallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient balance. Available: " + senderWallet.getBalance() +
                            ", Required: " + request.getAmount());
        }

        UUID firstLockId  = senderWallet.getId().compareTo(request.getReceiverWalletId()) < 0
                ? senderWallet.getId()
                : request.getReceiverWalletId();
        UUID secondLockId = senderWallet.getId().compareTo(request.getReceiverWalletId()) < 0
                ? request.getReceiverWalletId()
                : senderWallet.getId();

        Wallet firstWallet = walletRepository.findByIdWithLock(firstLockId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found: " + firstLockId));
        Wallet secondWallet = walletRepository.findByIdWithLock(secondLockId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found: " + secondLockId));

        Wallet lockedSender   = firstWallet.getId().equals(senderWallet.getId()) ? firstWallet : secondWallet;
        Wallet lockedReceiver = firstWallet.getId().equals(senderWallet.getId()) ? secondWallet : firstWallet;

        if (lockedReceiver.getStatus() != WalletStatus.ACTIVE) {
            throw new InvalidTransferException("Receiver wallet is not active");
        }

        if (lockedSender.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient balance. Available: " + lockedSender.getBalance() +
                            ", Required: " + request.getAmount());
        }

        String referenceId = UUID.randomUUID().toString();

        BigDecimal senderBalanceBefore   = lockedSender.getBalance();
        BigDecimal receiverBalanceBefore = lockedReceiver.getBalance();

        BigDecimal senderBalanceAfter   = senderBalanceBefore.subtract(request.getAmount());
        BigDecimal receiverBalanceAfter = receiverBalanceBefore.add(request.getAmount());

        lockedSender.setBalance(senderBalanceAfter);
        lockedReceiver.setBalance(receiverBalanceAfter);

        walletRepository.save(lockedSender);
        walletRepository.save(lockedReceiver);

        String description = request.getDescription() != null
                ? request.getDescription()
                : "Transfer";

        ledgerService.recordEntry(lockedSender, sender, EntryType.DEBIT,
                request.getAmount(), senderBalanceBefore, senderBalanceAfter,
                referenceId, description);

        ledgerService.recordEntry(lockedReceiver, lockedReceiver.getUser(), EntryType.CREDIT,
                request.getAmount(), receiverBalanceBefore, receiverBalanceAfter,
                referenceId, description);

        return new TransferResponse(
                referenceId,
                lockedSender.getId(),
                lockedReceiver.getId(),
                request.getAmount(),
                senderBalanceAfter,
                description,
                LocalDateTime.now()
        );
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public TransferResponse deposit(User user, DepositRequest request) {

        Wallet wallet = walletRepository.findByIdWithLock(
                        walletRepository.findByUser(user)
                                .orElseThrow(() -> new WalletNotFoundException("Wallet not found"))
                                .getId())
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found"));

        if (wallet.getStatus() != WalletStatus.ACTIVE) {
            throw new InvalidTransferException("Wallet is not active");
        }

        String referenceId = UUID.randomUUID().toString();
        BigDecimal balanceBefore = wallet.getBalance();
        BigDecimal balanceAfter  = balanceBefore.add(request.getAmount());

        wallet.setBalance(balanceAfter);
        walletRepository.save(wallet);

        String description = request.getDescription() != null ? request.getDescription() : "Deposit";

        ledgerService.recordEntry(wallet, user, EntryType.CREDIT,
                request.getAmount(), balanceBefore, balanceAfter, referenceId, description);

        return new TransferResponse(referenceId, null, wallet.getId(),
                request.getAmount(), balanceAfter, description, LocalDateTime.now());
    }
>>>>>>> main:Finance_and_Banking-Core_Payment_Ledger_and_Wallet_System/src/main/java/com/payment/ledger/service/TransferServiceImpl.java
}
