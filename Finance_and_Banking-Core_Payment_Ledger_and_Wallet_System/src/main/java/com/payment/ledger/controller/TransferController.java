package com.payment.ledger.controller;

import com.payment.ledger.dto.request.TransferRequest;
import com.payment.ledger.dto.response.TransferResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.service.TransferService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transfer")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    /**
     * Transfer funds between wallets.
     * Sender is derived from authenticated JWT user.
     */
    @PostMapping
    public ResponseEntity<TransferResponse> transfer(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody TransferRequest request) {

        TransferResponse response =
                transferService.transfer(currentUser, request);

        return ResponseEntity.ok(response);
    }
}