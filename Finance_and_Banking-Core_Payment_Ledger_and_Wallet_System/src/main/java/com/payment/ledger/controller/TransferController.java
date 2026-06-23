package com.payment.ledger.controller;

import com.payment.ledger.dto.request.TransferRequest;
import com.payment.ledger.dto.response.TransferResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.service.TransferService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.payment.ledger.service.IdempotencyService;
import com.payment.ledger.exception.MissingIdempotencyKeyException;


@RestController
@RequestMapping("/api/transfer")
public class TransferController {

    private final TransferService transferService;
    private final IdempotencyService idempotencyService;

    public TransferController(TransferService transferService,
               IdempotencyService idempotencyService) {
        this.transferService = transferService;
        this.idempotencyService = idempotencyService;
    }

    /**
     * Transfer funds between wallets.
     * Sender is derived from authenticated JWT user.
     */
    @PostMapping
    public ResponseEntity<TransferResponse> transfer(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody TransferRequest request,
        @RequestHeader(value= "Idempotency-Key",required = false) String idempotencyKey) {

             if(idempotencyKey == null|| idempotencyKey.trim().isEmpty()){
                throw new MissingIdempotencyKeyException("Idempotency-key header is required");
             }
        TransferResponse response = idempotencyService.executeIdempotent(
          idempotencyKey,
          TransferResponse.class,
         () -> transferService.transfer(currentUser, request)
        );
        return ResponseEntity.ok(response);
    }
}