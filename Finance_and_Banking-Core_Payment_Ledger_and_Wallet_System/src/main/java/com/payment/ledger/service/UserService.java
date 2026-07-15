package com.payment.ledger.service;

import com.payment.ledger.dto.request.*;
import com.payment.ledger.dto.response.*;

public interface UserService {

     OtpResponse initiateRegistration(InitiateRegistrationRequest request);
     AuthResponse verifyOtpAndActivate(VerifyOtpRequest request);
     OtpResponse resendOtp(String email);
}