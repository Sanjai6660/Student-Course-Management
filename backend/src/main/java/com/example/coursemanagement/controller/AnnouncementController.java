package com.example.coursemanagement.controller;

import com.example.coursemanagement.entity.Announcement;
import com.example.coursemanagement.entity.User;
import com.example.coursemanagement.payload.request.AnnouncementRequest;
import com.example.coursemanagement.payload.response.MessageResponse;
import com.example.coursemanagement.repository.AnnouncementRepository;
import com.example.coursemanagement.repository.UserRepository;
import com.example.coursemanagement.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    AnnouncementRepository announcementRepository;

    @Autowired
    UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return null;
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId.longValue()).orElse(null);
    }

    @GetMapping
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ROLE_STUDENT') or hasRole('ROLE_ADMIN')")
    public List<Announcement> getAnnouncementsByUserId(@PathVariable long userId) {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public ResponseEntity<?> createAnnouncement(@NonNull @RequestBody AnnouncementRequest request) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.badRequest().body(new MessageResponse("User not found"));

        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setAuthor(user);
        
        announcementRepository.save(announcement);

        return ResponseEntity.ok(new MessageResponse("Announcement published successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateAnnouncement(@PathVariable long id, @NonNull @RequestBody AnnouncementRequest request) {
        return announcementRepository.findById(id)
                .map(announcement -> {
                    announcement.setTitle(request.getTitle());
                    announcement.setContent(request.getContent());
                    announcementRepository.save(announcement);
                    return ResponseEntity.ok(new MessageResponse("Announcement updated successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reply")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> replyToAnnouncement(@PathVariable long id, @RequestBody AnnouncementRequest request) {
        return announcementRepository.findById(id).map(ann -> {
            ann.setReply(request.getContent());
            announcementRepository.save(ann);
            return ResponseEntity.ok(new MessageResponse("Reply added successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable long id) {
        if (announcementRepository.existsById(id)) {
            announcementRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Announcement deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
