package com.payment.ledger.service;

import com.payment.ledger.dto.request.DepositRequest;
import com.payment.ledger.dto.request.TransferRequest;
import com.payment.ledger.dto.request.WithdrawRequest;
import com.payment.ledger.dto.response.LedgerEntryResponse;
import com.payment.ledger.dto.response.TransferResponse;
import com.payment.ledger.entity.User;

import java.util.List;

public interface TransferService {

    TransferResponse transfer(User sender, TransferRequest request);

    TransferResponse deposit(User user, DepositRequest request);

    TransferResponse withdraw(User user, WithdrawRequest request);

    List<LedgerEntryResponse> getTransactionHistory(User user);
}