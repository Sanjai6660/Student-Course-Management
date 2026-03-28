package com.example.coursemanagement.controller;

import com.example.coursemanagement.entity.Notification;
import com.example.coursemanagement.repository.NotificationRepository;
import com.example.coursemanagement.payload.response.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    NotificationRepository notificationRepository;

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ROLE_STUDENT') or hasRole('ROLE_ADMIN')")
    public List<Notification> getNotificationsByUserId(@PathVariable long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteNotification(@PathVariable long id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Notification dismissed successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
