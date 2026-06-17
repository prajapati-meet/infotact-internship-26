package com.payment.ledger.controller;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.payment.ledger.dto.request.DepositRequest;
import com.payment.ledger.dto.request.WithdrawRequest;
import com.payment.ledger.dto.response.LedgerEntryResponse;
import com.payment.ledger.dto.response.TransferResponse;
import com.payment.ledger.dto.response.WalletResponse;
import com.payment.ledger.service.interfaces.TransferService;
import com.payment.ledger.entity.User;
import com.payment.ledger.service.interfaces.WalletService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/wallet")
@Validated
public class WalletController {
	
	
	private final WalletService walletService;
    private final TransferService transferService;

    public WalletController(
        WalletService walletService,
        TransferService transferService) {
        this.walletService = walletService;
        this.transferService=transferService;
    }

    @GetMapping("/me")
    public ResponseEntity<WalletResponse> getMyWallet(
            @AuthenticationPrincipal User user) {

        WalletResponse response = walletService.getWalletForUser(user);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/deposit")
    public ResponseEntity<TransferResponse> deposit(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DepositRequest request) {

        TransferResponse response = transferService.deposit(user, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/withdraw")
    public ResponseEntity<TransferResponse> withdraw(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody WithdrawRequest request) {

        TransferResponse response = transferService.withdraw(user, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<LedgerEntryResponse>> getTransactionHistory(
            @AuthenticationPrincipal User user) {

        List<LedgerEntryResponse> transactions =
                transferService.getTransactionHistory(user);

        return ResponseEntity.ok(transactions);
    }

}
