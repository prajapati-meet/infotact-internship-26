package com.payment.ledger.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class UserTest {

    @Test
    @DisplayName("Should lock account after 5 consecutive failed login attempts")
    void recordFailedLoginAttempt_AfterFiveFailures_ShouldLockAccount() {
        User user = new User();

        for (int i = 0; i < 5; i++) {
            user.recordFailedLoginAttempt();
        }

        assertThat(user.isAccountLocked()).isTrue();
        assertThat(user.getLockedUntil()).isNotNull();
        assertThat(user.isAccountNonLocked()).isFalse();
    }

    @Test
    @DisplayName("Should NOT lock account before reaching 5 failed attempts")
    void recordFailedLoginAttempt_BeforeThreshold_ShouldNotLockAccount() {
        User user = new User();

        for (int i = 0; i < 4; i++) {
            user.recordFailedLoginAttempt();
        }

        assertThat(user.isAccountLocked()).isFalse();
        assertThat(user.getLockedUntil()).isNull();
        assertThat(user.isAccountNonLocked()).isTrue();
    }

    @Test
    @DisplayName("Should unlock automatically after lock duration has passed")
    void isAccountNonLocked_AfterLockExpiry_ShouldReturnTrue() {
        User user = new User();
        user.setAccountLocked(true);
        user.setLockedUntil(LocalDateTime.now().minusMinutes(1)); // already expired

        assertThat(user.isAccountNonLocked()).isTrue();
    }

    @Test
    @DisplayName("Should remain locked while still within the cooldown window")
    void isAccountNonLocked_DuringCooldown_ShouldReturnFalse() {
        User user = new User();
        user.setAccountLocked(true);
        user.setLockedUntil(LocalDateTime.now().plusMinutes(10)); // still locked

        assertThat(user.isAccountNonLocked()).isFalse();
    }

    @Test
    @DisplayName("Should reset failed attempts and unlock on successful login")
    void resetFailedLoginAttempts_ShouldClearLockState() {
        User user = new User();
        user.recordFailedLoginAttempt();
        user.recordFailedLoginAttempt();

        user.resetFailedLoginAttempts();

        assertThat(user.getFailedLoginAttempts()).isEqualTo(0);
        assertThat(user.isAccountLocked()).isFalse();
        assertThat(user.getLockedUntil()).isNull();
    }

    @Test
    @DisplayName("Should be enabled by default after entity creation lifecycle")
    void onCreate_ShouldSetEnabledTrueByDefault() {
        User user = new User();
        user.onCreate();

        assertThat(user.isEnabled()).isTrue();
    }

    @Test
    @DisplayName("Should return false from isEnabled when account is disabled")
    void isEnabled_WhenDisabled_ShouldReturnFalse() {
        User user = new User();
        user.setEnabled(false);

        assertThat(user.isEnabled()).isFalse();
    }

    @Test
    @DisplayName("Should be non-expired when no account expiry date is set")
    void isAccountNonExpired_WithNoExpiryDate_ShouldReturnTrue() {
        User user = new User();
        user.setAccountExpiryDate(null);

        assertThat(user.isAccountNonExpired()).isTrue();
    }

    @Test
    @DisplayName("Should be expired when expiry date is in the past")
    void isAccountNonExpired_WithPastExpiryDate_ShouldReturnFalse() {
        User user = new User();
        user.setAccountExpiryDate(LocalDateTime.now().minusDays(1));

        assertThat(user.isAccountNonExpired()).isFalse();
    }

    @Test
    @DisplayName("Should be non-expired when expiry date is in the future")
    void isAccountNonExpired_WithFutureExpiryDate_ShouldReturnTrue() {
        User user = new User();
        user.setAccountExpiryDate(LocalDateTime.now().plusDays(30));

        assertThat(user.isAccountNonExpired()).isTrue();
    }

    @Test
    @DisplayName("Should have credentials expiry set 90 days out after entity creation lifecycle")
    void onCreate_ShouldSetCredentialsExpiryNinetyDaysOut() {
        User user = new User();
        user.onCreate();

        assertThat(user.getCredentialsExpiryDate()).isAfter(LocalDateTime.now().plusDays(89));
        assertThat(user.getCredentialsExpiryDate()).isBefore(LocalDateTime.now().plusDays(91));
    }

    @Test
    @DisplayName("Should report credentials expired when expiry date is in the past")
    void isCredentialsNonExpired_WithPastExpiryDate_ShouldReturnFalse() {
        User user = new User();
        user.setCredentialsExpiryDate(LocalDateTime.now().minusDays(1));

        assertThat(user.isCredentialsNonExpired()).isFalse();
    }

    @Test
    @DisplayName("Should report credentials valid when expiry date is in the future")
    void isCredentialsNonExpired_WithFutureExpiryDate_ShouldReturnTrue() {
        User user = new User();
        user.setCredentialsExpiryDate(LocalDateTime.now().plusDays(30));

        assertThat(user.isCredentialsNonExpired()).isTrue();
    }
}