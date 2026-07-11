package com.payment.ledger.service;

import com.payment.ledger.dto.response.NotificationResponse;
import com.payment.ledger.dto.response.UnreadCountResponse;
import com.payment.ledger.entity.Notification;
import com.payment.ledger.entity.User;
import com.payment.ledger.enums.NotificationType;
import com.payment.ledger.exception.NotificationNotFoundException;
import com.payment.ledger.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional
    public void createNotification(User user, String title,
                                   String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createNotificationInNewTransaction(User user, String title,
                                                   String message, NotificationType type) {
        createNotification(user, title, message, type);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getAllNotifications(User user) {
        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(User user) {
        return notificationRepository
                .findByUserAndIsReadFalseOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(User user) {
        long count = notificationRepository.countByUserAndIsReadFalse(user);
        return new UnreadCountResponse(count);
    }

    @Override
    @Transactional
    public void markAsRead(UUID notificationId, User user) {
        Notification notification = notificationRepository
                .findByIdAndUser(notificationId, user)
                .orElseThrow(() -> new NotificationNotFoundException(
                        "Notification not found: " + notificationId));

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadForUser(user);
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}