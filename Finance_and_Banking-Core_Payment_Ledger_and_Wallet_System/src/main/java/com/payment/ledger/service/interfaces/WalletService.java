package com.payment.ledger.service.interfaces;

import com.payment.ledger.dto.response.WalletResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.entity.Wallet;

public interface WalletService {

    Wallet createWalletForUser(User user);

    WalletResponse getWalletForUser(User user);
}