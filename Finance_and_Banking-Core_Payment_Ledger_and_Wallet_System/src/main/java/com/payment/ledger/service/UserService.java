package com.payment.ledger.service;

import com.payment.ledger.dto.request.RegisterRequest;
import com.payment.ledger.dto.response.AuthResponse;

public interface UserService {
     AuthResponse register(RegisterRequest request);
}