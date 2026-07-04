package com.payment.ledger.service;

public interface OtpService
{
    public void generateAndSendOtp(String email);

    public void validateOtp(String email, String otp);

    public void clearOtp(String email);
}