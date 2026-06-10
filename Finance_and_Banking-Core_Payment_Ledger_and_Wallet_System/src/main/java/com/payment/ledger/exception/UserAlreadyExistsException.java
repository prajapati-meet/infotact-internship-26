package com.payment.ledger.exception;

public class UserAlreadyExistsException  extends RuntimeException {

    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
