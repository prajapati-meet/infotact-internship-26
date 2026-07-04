package com.payment.ledger.controller;

import com.payment.ledger.dto.request.InitiateRegistrationRequest;
import com.payment.ledger.dto.request.LoginRequest;
import com.payment.ledger.dto.request.VerifyOtpRequest;
import com.payment.ledger.dto.response.AuthResponse;
import com.payment.ledger.dto.response.OtpResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.exception.MissingIdempotencyKeyException;
import com.payment.ledger.repository.UserRepository;
import com.payment.ledger.service.JwtService;
import com.payment.ledger.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthController(UserService userService,
                          AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          UserRepository userRepository) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register/initiate")
    public ResponseEntity<OtpResponse> initiateRegistration(
            @Valid @RequestBody InitiateRegistrationRequest request) {
        OtpResponse response = userService.initiateRegistration(request);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/register/verify")
    public ResponseEntity<AuthResponse> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = userService.verifyOtpAndActivate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(), request.getPassword()
                    )
            );

            User user = (User) auth.getPrincipal();
            user.resetFailedLoginAttempts();
            userRepository.save(user);

            String token = jwtService.generateToken(user);

            return ResponseEntity.ok(new AuthResponse(
                    token, 86400000L, user.getEmail(), user.getDisplayName()
            ));

        } catch (BadCredentialsException ex) {
            userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
                user.recordFailedLoginAttempt();
                userRepository.save(user);
            });
            throw ex;
        }
    }
}