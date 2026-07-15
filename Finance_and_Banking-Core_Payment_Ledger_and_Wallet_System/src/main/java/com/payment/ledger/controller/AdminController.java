package com.payment.ledger.controller;

import com.payment.ledger.dto.response.AdminStatsResponse;
import com.payment.ledger.dto.response.AdminUserResponse;
import com.payment.ledger.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        AdminStatsResponse response = adminService.getStats();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserResponse>> getUsers(
            @RequestParam(required = false, defaultValue = "") String search,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<AdminUserResponse> users = adminService.getUsers(search, pageable);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}/disable")
    public ResponseEntity<Void> disableUser(@PathVariable UUID userId) {
        adminService.disableUser(userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{userId}/enable")
    public ResponseEntity<Void> enableUser(@PathVariable UUID userId) {
        adminService.enableUser(userId);
        return ResponseEntity.ok().build();
    }
}
