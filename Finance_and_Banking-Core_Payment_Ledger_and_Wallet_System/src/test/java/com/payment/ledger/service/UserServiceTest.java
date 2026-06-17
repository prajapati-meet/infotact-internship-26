package com.payment.ledger.service;

import com.payment.ledger.dto.request.RegisterRequest;
import com.payment.ledger.dto.response.AuthResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.exception.UserAlreadyExistsException;
import com.payment.ledger.repository.UserRepository;
import com.payment.ledger.service.impl.UserServiceImpl;
import com.payment.ledger.service.interfaces.WalletService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletService walletService;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void shouldRegisterUserSuccessfully() {

        RegisterRequest request = new RegisterRequest();
        request.setUsername("sadhana");
        request.setEmail("sadhana@test.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail(request.getEmail()))
                .thenReturn(false);

        when(userRepository.existsByUsername(request.getUsername()))
                .thenReturn(false);

        when(passwordEncoder.encode(request.getPassword()))
                .thenReturn("encodedPassword");

        User savedUser = new User();
        savedUser.setId(UUID.randomUUID());
        savedUser.setUsername("sadhana");
        savedUser.setEmail("sadhana@test.com");
        savedUser.setPasswordHash("encodedPassword");

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);

        when(jwtService.generateToken(savedUser))
                .thenReturn("jwt-token");

        AuthResponse response = userService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("jwt-token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getEmail()).isEqualTo("sadhana@test.com");
        assertThat(response.getUsername()).isEqualTo("sadhana");

        verify(userRepository).save(any(User.class));
        verify(walletService).createWalletForUser(savedUser);
        verify(jwtService).generateToken(savedUser);
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {

        RegisterRequest request = new RegisterRequest();
        request.setUsername("sadhana");
        request.setEmail("existing@test.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail(request.getEmail()))
                .thenReturn(true);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining("Email already registered");

        verify(userRepository, never()).save(any());
        verify(walletService, never()).createWalletForUser(any());
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void shouldThrowExceptionWhenUsernameAlreadyExists() {

        RegisterRequest request = new RegisterRequest();
        request.setUsername("existingUser");
        request.setEmail("new@test.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail(request.getEmail()))
                .thenReturn(false);

        when(userRepository.existsByUsername(request.getUsername()))
                .thenReturn(true);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining("Username already registered");

        verify(userRepository, never()).save(any());
        verify(walletService, never()).createWalletForUser(any());
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void shouldHashPasswordBeforeSaving() {

        RegisterRequest request = new RegisterRequest();
        request.setUsername("sadhana");
        request.setEmail("sadhana@test.com");
        request.setPassword("plainPassword");

        when(userRepository.existsByEmail(anyString()))
                .thenReturn(false);

        when(userRepository.existsByUsername(anyString()))
                .thenReturn(false);

        when(passwordEncoder.encode("plainPassword"))
                .thenReturn("hashedPassword");

        User savedUser = new User();
        savedUser.setId(UUID.randomUUID());

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);

        when(jwtService.generateToken(any(User.class)))
                .thenReturn("jwt-token");

        userService.register(request);

        ArgumentCaptor<User> userCaptor =
                ArgumentCaptor.forClass(User.class);

        verify(userRepository).save(userCaptor.capture());

        User capturedUser = userCaptor.getValue();

        assertThat(capturedUser.getPassword())
                .isEqualTo("hashedPassword");

        assertThat(capturedUser.getPassword())
                .isNotEqualTo("plainPassword");

        verify(passwordEncoder).encode("plainPassword");
    }
}

