package com.payment.ledger.service;

import com.payment.ledger.dto.response.WalletResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.entity.Wallet;
import com.payment.ledger.enums.NotificationType;
import com.payment.ledger.enums.WalletStatus;
import com.payment.ledger.exception.ResourceNotFoundException;
import com.payment.ledger.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceImplTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private WalletServiceImpl walletService;

    private User user;
    private Wallet wallet;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setEmail("user@example.com");
        user.setUsername("testuser");

        wallet = new Wallet();
        wallet.setId(UUID.randomUUID());
        wallet.setUser(user);
        wallet.setBalance(BigDecimal.ZERO);
        wallet.setCurrency("INR");
        wallet.setStatus(WalletStatus.ACTIVE);
        wallet.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("createWalletForUser: creates wallet and saves, notifies user")
    void createWalletForUser_ShouldCreateAndNotify() {
        // Arrange
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> {
            Wallet w = invocation.getArgument(0);
            w.setId(UUID.randomUUID());
            return w;
        });

        // Act
        Wallet created = walletService.createWalletForUser(user);

        // Assert
        assertThat(created).isNotNull();
        assertThat(created.getUser()).isEqualTo(user);
        assertThat(created.getBalance()).isZero();
        assertThat(created.getCurrency()).isEqualTo("INR");
        assertThat(created.getStatus()).isEqualTo(WalletStatus.ACTIVE);

        verify(walletRepository).save(any(Wallet.class));
        verify(notificationService).createNotification(
                eq(user),
                eq("Wallet Created"),
                contains("ready to use"),
                eq(NotificationType.SUCCESS)
        );
    }

    @Test
    @DisplayName("getWalletForUser: wallet exists -> returns correct wallet response")
    void getWalletForUser_WalletExists_ReturnsResponse() {
        // Arrange
        when(walletRepository.findByUser(user)).thenReturn(Optional.of(wallet));

        // Act
        WalletResponse response = walletService.getWalletForUser(user);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(wallet.getId());
        assertThat(response.getBalance()).isEqualTo(BigDecimal.ZERO);
        assertThat(response.getCurrency()).isEqualTo("INR");
        assertThat(response.getStatus()).isEqualTo(WalletStatus.ACTIVE);

        verify(walletRepository).findByUser(user);
    }

    @Test
    @DisplayName("getWalletForUser: wallet does not exist -> throws ResourceNotFoundException")
    void getWalletForUser_WalletDoesNotExist_ThrowsException() {
        // Arrange
        when(walletRepository.findByUser(user)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> walletService.getWalletForUser(user))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Wallet not found for user");

        verify(walletRepository).findByUser(user);
    }
}
