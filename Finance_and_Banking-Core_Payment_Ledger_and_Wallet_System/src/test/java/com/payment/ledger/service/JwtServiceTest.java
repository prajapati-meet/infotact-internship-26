package com.payment.ledger.service;


import com.payment.ledger.entity.User;
import com.payment.ledger.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();

        ReflectionTestUtils.setField(
                jwtService,
                "secretKey",
                "dGVzdHRlc3R0ZXN0dGVzdHRlc3R0ZXN0dGVzdHRlc3R0ZXN0dGVzdA=="
        );

        ReflectionTestUtils.setField(
                jwtService,
                "jwtExpiration",
                86400000L
        );

        user = new User();
        user.setUsername("Sadhana");
        user.setEmail("sadhana@test.com");
        user.setPasswordHash("password");
        user.setRole(Role.USER);
    }

    @Test
    @DisplayName("Should generate JWT token successfully")
    void shouldGenerateTokenSuccessfully() {

        String token = jwtService.generateToken(user);

        assertThat(token)
                .isNotNull()
                .isNotEmpty();
    }

    @Test
    @DisplayName("Should extract username(email) from token")
    void shouldExtractUsernameFromToken() {

        String token = jwtService.generateToken(user);

        String username = jwtService.extractUsername(token);

        assertThat(username)
                .isEqualTo(user.getEmail());
    }

    @Test
    @DisplayName("Should validate token for correct user")
    void shouldValidateTokenSuccessfully() {

        String token = jwtService.generateToken(user);

        boolean isValid = jwtService.isTokenValid(token, user);

        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Should reject token for different user")
    void shouldRejectTokenForDifferentUser() {

        String token = jwtService.generateToken(user);

        User anotherUser = new User();
        anotherUser.setUsername("Rahul");
        anotherUser.setEmail("rahul@test.com");
        anotherUser.setPasswordHash("password");
        anotherUser.setRole(Role.USER);

        boolean isValid = jwtService.isTokenValid(token, anotherUser);

        assertThat(isValid).isFalse();
    }
}


