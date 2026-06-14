package com.payment.ledger.service;

import com.payment.ledger.dto.response.WalletResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.entity.Wallet;
import com.payment.ledger.enums.WalletStatus;
import com.payment.ledger.exception.ResourceNotFoundException;
import com.payment.ledger.repository.WalletRepository;
import com.payment.ledger.service.WalletService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;


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

        return walletRepository.save(wallet);
    }

    
    @Transactional(readOnly = true)
    public WalletResponse getWalletForUser(User user) {

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Wallet not found for user: " + user.getEmail()));

        WalletResponse response = new WalletResponse();

        response.setId(wallet.getId());
        response.setBalance(wallet.getBalance());
        response.setCurrency(wallet.getCurrency());
        response.setStatus(wallet.getStatus());
        response.setCreatedAt(wallet.getCreatedAt());

        return response;
    }
}
