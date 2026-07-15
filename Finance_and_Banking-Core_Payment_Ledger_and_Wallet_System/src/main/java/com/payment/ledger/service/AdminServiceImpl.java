package com.payment.ledger.service;

import com.payment.ledger.dto.response.AdminStatsResponse;
import com.payment.ledger.dto.response.AdminUserResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.enums.AccountStatus;
import com.payment.ledger.exception.ResourceNotFoundException;
import com.payment.ledger.repository.LedgerEntryRepository;
import com.payment.ledger.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    public AdminServiceImpl(UserRepository userRepository, LedgerEntryRepository ledgerEntryRepository) {
        this.userRepository = userRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByAccountStatus(AccountStatus.ACTIVE);
        long disabledUsers = userRepository.countByAccountStatus(AccountStatus.SUSPENDED);
        long totalTransactions = ledgerEntryRepository.count();

        return new AdminStatsResponse(totalUsers, activeUsers, disabledUsers, totalTransactions);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getUsers(String search, Pageable pageable) {
        Page<User> users;
        if (search == null || search.trim().isEmpty()) {
            users = userRepository.findAll(pageable);
        } else {
            users = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable);
        }

        return users.map(user -> {
            BigDecimal balance = BigDecimal.ZERO;
            if (user.getWallet() != null) {
                balance = user.getWallet().getBalance();
            }
            long totalTx = ledgerEntryRepository.countByUser(user);

            return new AdminUserResponse(
                    user.getId(),
                    user.getDisplayName(),
                    user.getEmail(),
                    user.getProfilePhoto(),
                    balance,
                    user.getAccountStatus(),
                    totalTx,
                    user.isEnabledRaw()
            );
        });
    }

    @Override
    @Transactional
    public void disableUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setEnabled(false);
        user.setAccountStatus(AccountStatus.SUSPENDED);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void enableUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setEnabled(true);
        user.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(user);
    }
}
