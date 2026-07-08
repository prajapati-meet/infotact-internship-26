package com.payment.ledger.controller;

import com.payment.ledger.dto.response.NotificationResponse;
import com.payment.ledger.dto.response.UnreadCountResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAllNotifications(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
                notificationService.getAllNotifications(currentUser));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(currentUser));
    }


    @GetMapping("/unread/count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
                notificationService.getUnreadCount(currentUser));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        notificationService.markAsRead(id, currentUser);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User currentUser) {
        notificationService.markAllAsRead(currentUser);
        return ResponseEntity.ok().build();
    }
}