package com.payment.ledger.service;

import com.payment.ledger.dto.response.AdminStatsResponse;
import com.payment.ledger.dto.response.AdminUserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AdminService {
    AdminStatsResponse getStats();
    Page<AdminUserResponse> getUsers(String search, Pageable pageable);
    void disableUser(UUID userId);
    void enableUser(UUID userId);
}
