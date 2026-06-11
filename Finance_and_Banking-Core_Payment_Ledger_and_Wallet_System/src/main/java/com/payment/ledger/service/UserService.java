package com.payment.ledger.service;

import com.payment.ledger.dto.request.RegisterRequest;
import com.payment.ledger.entity.User;
import com.payment.ledger.enums.Role;
import com.payment.ledger.exception.UserAlreadyExistsException;
import com.payment.ledger.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.payment.ledger.dto.response.AuthResponse;

@Service
public class UserService {

    private static final String BEARER = "Bearer";
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       WalletService walletService,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        // Check email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException(
                    "Email already registered: " + request.getEmail());
        }

        // Check username uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException(
                    "Username already registered: " + request.getUsername());
        }

        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        User savedUser = userRepository.save(user);

        walletService.createWalletForUser(savedUser);

        String token = jwtService.generateToken(savedUser);

        AuthResponse response = new AuthResponse();
        response.setAccessToken(token);
        response.setTokenType(BEARER);
        response.setExpiresIn(86400); // or jwtExpiration
        response.setEmail(savedUser.getEmail());
        response.setUsername(savedUser.getUsername());

        return response;

    }

}
