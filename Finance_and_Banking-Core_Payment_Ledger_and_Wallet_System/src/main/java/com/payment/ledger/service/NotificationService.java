package com.payment.ledger.service;

import com.payment.ledger.dto.response.NotificationResponse;
import com.payment.ledger.dto.response.UnreadCountResponse;
import com.payment.ledger.entity.User;
import com.payment.ledger.enums.NotificationType;

import java.util.List;
import java.util.UUID;

public interface NotificationService {

    // Internal — called by other services to create notifications
    void createNotification(User user, String title, String message, NotificationType type);

    // External — called by controller
    List<NotificationResponse> getAllNotifications(User user);
    List<NotificationResponse> getUnreadNotifications(User user);
    UnreadCountResponse getUnreadCount(User user);
    void markAsRead(UUID notificationId, User user);
    void markAllAsRead(User user);
}