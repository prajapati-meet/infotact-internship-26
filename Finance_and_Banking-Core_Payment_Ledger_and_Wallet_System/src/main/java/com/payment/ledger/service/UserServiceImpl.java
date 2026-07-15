package com.payment.ledger.service;

import com.payment.ledger.dto.request.InitiateRegistrationRequest;
import com.payment.ledger.dto.request.VerifyOtpRequest;
import com.payment.ledger.dto.response.AuthResponse;
import com.payment.ledger.dto.response.OtpResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.enums.*;
import com.payment.ledger.enums.Role;
import com.payment.ledger.exception.InvalidOtpException;
import com.payment.ledger.exception.ResourceNotFoundException;
import com.payment.ledger.exception.UserAlreadyExistsException;
import com.payment.ledger.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final WalletService walletService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    public UserServiceImpl(UserRepository userRepository,
                           WalletService walletService,
                           JwtService jwtService,
                           PasswordEncoder passwordEncoder,
                           OtpService otpService) {
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
    }

    @Override
    @Transactional
    public OtpResponse initiateRegistration(InitiateRegistrationRequest request) {

        if (userRepository.existsByEmailAndAccountStatus(request.getEmail(), AccountStatus.ACTIVE)) {
            throw new UserAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        if (userRepository.existsByUsernameAndAccountStatus(request.getUsername(), AccountStatus.ACTIVE)) {
            throw new UserAlreadyExistsException("Username already taken: " + request.getUsername());
        }

        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            userRepository.delete(user);
            userRepository.flush();
        });

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        if (request.getEmail().equalsIgnoreCase("admin@ledger.com")) {
            user.setRole(Role.ADMIN);
        } else {
            user.setRole(Role.USER);
        }

        userRepository.save(user);

        otpService.generateAndSendOtp(request.getEmail());

        return new OtpResponse(
                "OTP sent to " + request.getEmail() + ". Please verify within 10 minutes.",
                request.getEmail()
        );
    }

    @Override
    @Transactional
    public AuthResponse verifyOtpAndActivate(VerifyOtpRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No pending registration found for: " + request.getEmail()));

        if (user.getAccountStatus() != AccountStatus.PENDING) {
            throw new InvalidOtpException("Account is already verified. Please login.");
        }

        otpService.validateOtp(request.getEmail(), request.getOtp());

        user.setEnabled(true);
        user.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(user);

        otpService.clearOtp(request.getEmail());

        walletService.createWalletForUser(user);

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                86400000L,
                user.getEmail(),
                user.getDisplayName(),
                user.getRole().name(),
                user.getProfilePhoto()
        );
    }

    @Override
    @Transactional
    public OtpResponse resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No pending registration found for: " + email));

        if (user.getAccountStatus() != AccountStatus.PENDING) {
            throw new InvalidOtpException("Account is already verified. Please login.");
        }

        otpService.resendOtp(email);

        return new OtpResponse(
                "A new OTP has been sent to " + email + ". Please verify within 5 minutes.",
                email
        );
    }
}