package com.payment.ledger.service;

import java.util.function.Supplier;

public interface IdempotencyService {

    <T> T executeIdempotent(String idempotencyKey, Class<T> responseType, Supplier<T> operation);
}