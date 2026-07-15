package com.payment.ledger.service;

import com.payment.ledger.dto.request.InitiateRegistrationRequest;
import com.payment.ledger.dto.response.OtpResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.enums.AccountStatus;
import com.payment.ledger.enums.Role;
import com.payment.ledger.exception.UserAlreadyExistsException;
import com.payment.ledger.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.payment.ledger.dto.request.VerifyOtpRequest;
import com.payment.ledger.dto.response.AuthResponse;
import com.payment.ledger.exception.OtpExpiredException;
import com.payment.ledger.exception.ResourceNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private WalletService walletService;
    @Mock private JwtService jwtService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private OtpService otpService;

    @InjectMocks
    private UserServiceImpl userService;

    private InitiateRegistrationRequest request;

    @BeforeEach
    void setUp() {
        request = new InitiateRegistrationRequest();
        request.setEmail("meet@example.com");
        request.setUsername("meetp");
        request.setPassword("Passw0rd!");
    }

    @Test
    @DisplayName("initiateRegistration: new user, no conflicts -> saves user and sends OTP")
    void initiateRegistration_newUser_savesAndSendsOtp() {
        // Arrange
        when(userRepository.existsByEmailAndAccountStatus(request.getEmail(), AccountStatus.ACTIVE))
                .thenReturn(false);
        when(userRepository.existsByUsernameAndAccountStatus(request.getUsername(), AccountStatus.ACTIVE))
                .thenReturn(false);
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(request.getPassword())).thenReturn("hashed-password");

        // Act
        OtpResponse response = userService.initiateRegistration(request);

        // Assert
        assertThat(response.getEmail()).isEqualTo(request.getEmail());
        verify(userRepository).save(argThat(user ->
                user.getEmail().equals(request.getEmail()) &&
                        user.getPasswordHash().equals("hashed-password") &&
                        user.getRole() == Role.USER
        ));
        verify(otpService).generateAndSendOtp(request.getEmail());
    }

    @Test
    @DisplayName("initiateRegistration: admin email -> assigns ADMIN role")
    void initiateRegistration_adminEmail_assignsAdminRole() {
        request.setEmail("admin@ledger.com");
        when(userRepository.existsByEmailAndAccountStatus(anyString(), eq(AccountStatus.ACTIVE)))
                .thenReturn(false);
        when(userRepository.existsByUsernameAndAccountStatus(anyString(), eq(AccountStatus.ACTIVE)))
                .thenReturn(false);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");

        userService.initiateRegistration(request);

        verify(userRepository).save(argThat(user -> user.getRole() == Role.ADMIN));
    }

    @Test
    @DisplayName("initiateRegistration: email already ACTIVE -> throws UserAlreadyExistsException")
    void initiateRegistration_emailAlreadyActive_throwsException() {
        when(userRepository.existsByEmailAndAccountStatus(request.getEmail(), AccountStatus.ACTIVE))
                .thenReturn(true);

        assertThatThrownBy(() -> userService.initiateRegistration(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining(request.getEmail());

        verify(userRepository, never()).save(any());
        verify(otpService, never()).generateAndSendOtp(anyString());
    }

    @Test
    @DisplayName("initiateRegistration: username already ACTIVE -> throws UserAlreadyExistsException")
    void initiateRegistration_usernameAlreadyActive_throwsException() {
        when(userRepository.existsByEmailAndAccountStatus(anyString(), eq(AccountStatus.ACTIVE)))
                .thenReturn(false);
        when(userRepository.existsByUsernameAndAccountStatus(request.getUsername(), AccountStatus.ACTIVE))
                .thenReturn(true);

        assertThatThrownBy(() -> userService.initiateRegistration(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining(request.getUsername());
    }

    @Test
    @DisplayName("initiateRegistration: stale PENDING row exists -> deletes it before creating new one")
    void initiateRegistration_stalePendingUser_deletesBeforeCreating() {
        User staleUser = new User();
        staleUser.setEmail(request.getEmail());
        staleUser.setAccountStatus(AccountStatus.PENDING);

        when(userRepository.existsByEmailAndAccountStatus(anyString(), eq(AccountStatus.ACTIVE)))
                .thenReturn(false);
        when(userRepository.existsByUsernameAndAccountStatus(anyString(), eq(AccountStatus.ACTIVE)))
                .thenReturn(false);
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(staleUser));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");

        userService.initiateRegistration(request);

        verify(userRepository).delete(staleUser);
        verify(userRepository).flush();
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("verifyOtpAndActivate: valid OTP, PENDING user -> activates, creates wallet, returns token")
    void verifyOtpAndActivate_validOtp_activatesUser() {
        // Arrange
        User pendingUser = new User();
        pendingUser.setEmail("meet@example.com");
        pendingUser.setUsername("meetp");
        pendingUser.setAccountStatus(AccountStatus.PENDING);
        pendingUser.setRole(Role.USER);

        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("meet@example.com");
        request.setOtp("123456");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(pendingUser));
        doNothing().when(otpService).validateOtp(request.getEmail(), request.getOtp());
        when(jwtService.generateToken(pendingUser)).thenReturn("fake-jwt-token");

        // Act
        AuthResponse response = userService.verifyOtpAndActivate(request);

        // Assert
        assertThat(response.getAccessToken()).isEqualTo("fake-jwt-token");
        assertThat(pendingUser.getAccountStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(pendingUser.isEnabledRaw()).isTrue();

        verify(otpService).clearOtp(request.getEmail());
        verify(walletService).createWalletForUser(pendingUser);
        verify(userRepository).save(pendingUser);
    }

    @Test
    @DisplayName("verifyOtpAndActivate: user not found -> throws ResourceNotFoundException")
    void verifyOtpAndActivate_userNotFound_throwsException() {
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("ghost@example.com");
        request.setOtp("123456");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.verifyOtpAndActivate(request))
                .isInstanceOf(ResourceNotFoundException.class);

        verifyNoInteractions(otpService, walletService, jwtService);
    }

    @Test
    @DisplayName("verifyOtpAndActivate: user already ACTIVE -> throws InvalidOtpException, no OTP check")
    void verifyOtpAndActivate_alreadyActive_throwsException() {
        User activeUser = new User();
        activeUser.setEmail("meet@example.com");
        activeUser.setAccountStatus(AccountStatus.ACTIVE);

        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("meet@example.com");
        request.setOtp("123456");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(activeUser));

        assertThatThrownBy(() -> userService.verifyOtpAndActivate(request))
                .isInstanceOf(com.payment.ledger.exception.InvalidOtpException.class);

        // Critical: OTP validation must never run against an already-active account
        verifyNoInteractions(otpService);
    }

    @Test
    @DisplayName("verifyOtpAndActivate: expired OTP -> propagates OtpExpiredException, user not saved")
    void verifyOtpAndActivate_expiredOtp_propagatesException() {
        User pendingUser = new User();
        pendingUser.setEmail("meet@example.com");
        pendingUser.setAccountStatus(AccountStatus.PENDING);

        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("meet@example.com");
        request.setOtp("999999");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(pendingUser));
        doThrow(new OtpExpiredException("expired"))
                .when(otpService).validateOtp(request.getEmail(), request.getOtp());

        assertThatThrownBy(() -> userService.verifyOtpAndActivate(request))
                .isInstanceOf(OtpExpiredException.class);

        verify(userRepository, never()).save(any());
        verifyNoInteractions(walletService, jwtService);
    }

    @Test
    @DisplayName("resendOtp: PENDING user -> delegates to otpService.resendOtp")
    void resendOtp_pendingUser_delegatesToOtpService() {
        User pendingUser = new User();
        pendingUser.setEmail("meet@example.com");
        pendingUser.setAccountStatus(AccountStatus.PENDING);

        when(userRepository.findByEmail("meet@example.com")).thenReturn(Optional.of(pendingUser));

        OtpResponse response = userService.resendOtp("meet@example.com");

        assertThat(response.getEmail()).isEqualTo("meet@example.com");
        verify(otpService).resendOtp("meet@example.com");
    }

    @Test
    @DisplayName("resendOtp: already ACTIVE user -> throws InvalidOtpException, no resend triggered")
    void resendOtp_activeUser_throwsException() {
        User activeUser = new User();
        activeUser.setEmail("meet@example.com");
        activeUser.setAccountStatus(AccountStatus.ACTIVE);

        when(userRepository.findByEmail("meet@example.com")).thenReturn(Optional.of(activeUser));

        assertThatThrownBy(() -> userService.resendOtp("meet@example.com"))
                .isInstanceOf(com.payment.ledger.exception.InvalidOtpException.class);

        verify(otpService, never()).resendOtp(anyString());
    }
}