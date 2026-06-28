package com.payment.ledger.entity;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.payment.ledger.enums.Role;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(
    name = "users",
    uniqueConstraints = {
   @UniqueConstraint(columnNames = "email"),
    @UniqueConstraint(columnNames = "username")
}
)

public class User implements UserDetails {
    public static final int MAX_FAILED_ATTEMPTS = 5;
    public static final int LOCK_DURATION_MINUTES = 15;
    public static final int PASSWORD_VALIDITY_DAYS = 90;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false)
    private UUID id;

    @NotBlank
   @Column(nullable = false, unique = true, length = 50)
private String username;

    @NotBlank
    @Email
   @Column(nullable = false, unique = true, length = 100)
private String email;

    @NotBlank
    @Column(name = "passwordHash", nullable = false)
    private String passwordHash;
 @Column(nullable = false)
    private boolean enabled;

    @Column(nullable = false)
    private boolean accountLocked;

    @Column(nullable = false)
    private int failedLoginAttempts;

    private LocalDateTime lockedUntil;

    private LocalDateTime accountExpiryDate;

    private LocalDateTime credentialsExpiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "createdAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedAt", nullable = false)
    private LocalDateTime updatedAt;

    @OneToOne(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY
    )
    private Wallet wallet;

    @PrePersist
    public void onCreate() {
    LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        this.enabled = true;
        this.accountLocked = false;
        this.failedLoginAttempts = 0;
        this.credentialsExpiryDate = now.plusDays(PASSWORD_VALIDITY_DAYS);
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
  public void recordFailedLoginAttempt() {
        failedLoginAttempts++;

        if (failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
            accountLocked = true;
            lockedUntil = LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES);
        }
    }

    public void resetFailedLoginAttempts() {
        failedLoginAttempts = 0;
        accountLocked = false;
        lockedUntil = null;
    }

    public boolean isLockExpired() {
        return lockedUntil != null &&
                LocalDateTime.now().isAfter(lockedUntil);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name())
        );
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    public String getDisplayName() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
             return accountExpiryDate == null
                || accountExpiryDate.isAfter(LocalDateTime.now());
    }

    @Override
    public boolean isAccountNonLocked() {
        if (accountLocked && isLockExpired()) {
            resetFailedLoginAttempts();
        }

        return !accountLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsExpiryDate == null
                || credentialsExpiryDate.isAfter(LocalDateTime.now());
    }

    @Override
    public boolean isEnabled() {
  return enabled;
    }

    //getter and setter

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
       public String getPasswordHash() {
        return passwordHash;
    }


    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
  

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

   public boolean isAccountLocked() {
    return accountLocked;
}

    public void setAccountLocked(boolean accountLocked) {
        this.accountLocked = accountLocked;
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(int failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public LocalDateTime getLockedUntil() {
        return lockedUntil;
    }

    public void setLockedUntil(LocalDateTime lockedUntil) {
        this.lockedUntil = lockedUntil;
    }

    public LocalDateTime getAccountExpiryDate() {
        return accountExpiryDate;
    }

    public void setAccountExpiryDate(LocalDateTime accountExpiryDate) {
        this.accountExpiryDate = accountExpiryDate;
    }

    public LocalDateTime getCredentialsExpiryDate() {
        return credentialsExpiryDate;
    }

    public void setCredentialsExpiryDate(LocalDateTime credentialsExpiryDate) {
        this.credentialsExpiryDate = credentialsExpiryDate;
    }
    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Wallet getWallet() {
        return wallet;
    }

    public void setWallet(Wallet wallet) {
        this.wallet = wallet;
    }
}

