package com.payment.ledger.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.payment.ledger.dto.response.WalletResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.service.WalletService;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {
	
	
	private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/me")
    public ResponseEntity<WalletResponse> getMyWallet(
            @AuthenticationPrincipal User user) {

        WalletResponse response = walletService.getWalletForUser(user);
        return ResponseEntity.ok(response);
    }
}
