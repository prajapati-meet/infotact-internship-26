package com.payment.ledger.service;

import com.payment.ledger.dto.response.WalletResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.entity.Wallet;
import com.payment.ledger.enums.WalletStatus;
import com.payment.ledger.exception.ResourceNotFoundException;
import com.payment.ledger.repository.WalletRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import com.payment.ledger.enums.NotificationType;

import java.math.BigDecimal;

@Service
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final NotificationService notificationService;

    public WalletServiceImpl(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    @Transactional
    public Wallet createWalletForUser(User user) {
        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setBalance(BigDecimal.ZERO);
        wallet.setCurrency("USD");
        wallet.setStatus(WalletStatus.ACTIVE);
        Wallet saved = walletRepository.save(wallet);

        notificationService.createNotification(
                user,
                "Wallet Created",
                "Your wallet is ready to use. Start sending and receiving money.",
                NotificationType.SUCCESS
        );

        return saved;
    }


    @Transactional(readOnly = true)
    public WalletResponse getWalletForUser(User user) {
        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + user.getEmail()));

        return new WalletResponse(
                wallet.getId(),
                wallet.getBalance(),
                wallet.getCurrency(),
                wallet.getStatus(),
                wallet.getCreatedAt()
        );
    }
}
