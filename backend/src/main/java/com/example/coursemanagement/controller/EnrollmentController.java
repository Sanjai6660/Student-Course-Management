package com.example.coursemanagement.controller;

import com.example.coursemanagement.entity.Course;
import com.example.coursemanagement.entity.Enrollment;
import com.example.coursemanagement.entity.Notification;
import com.example.coursemanagement.entity.User;
import com.example.coursemanagement.payload.response.MessageResponse;
import com.example.coursemanagement.repository.CourseRepository;
import com.example.coursemanagement.repository.EnrollmentRepository;
import com.example.coursemanagement.repository.NotificationRepository;
import com.example.coursemanagement.repository.UserRepository;
import com.example.coursemanagement.security.services.UserDetailsImpl;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    @Autowired
    EnrollmentRepository enrollmentRepository;

    @Autowired
    CourseRepository courseRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    NotificationRepository notificationRepository;

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

    @PostMapping("/{courseId}")
    public ResponseEntity<?> enrollCourse(@PathVariable long courseId) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.badRequest().body(new MessageResponse("User not found"));

        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Already enrolled in this course"));
        }

        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) return ResponseEntity.badRequest().body(new MessageResponse("Course not found"));

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setStatus("IN_PROGRESS");
        enrollmentRepository.save(enrollment);

        // Generate Notification for Admins
        String message = "Student " + user.getName() + " (" + user.getEmail() + ") applied for course '" + course.getCourseName() + "'.";
        Notification notification = new Notification(message);
        notificationRepository.save(notification);

        // Generate Notification for the Student
        Notification studentNotification = new Notification("You have successfully applied for course '" + course.getCourseName() + "'.");
        studentNotification.setUser(user);
        notificationRepository.save(studentNotification);

        return ResponseEntity.ok(new MessageResponse("Successfully enrolled in course"));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Enrollment>> getMyEnrollments() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.badRequest().build();

        List<Enrollment> enrollments = enrollmentRepository.findByUserId(user.getId());
        return ResponseEntity.ok(enrollments);
    }

    @PutMapping("/{courseId}/complete")
    public ResponseEntity<?> completeCourse(@PathVariable long courseId) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.badRequest().body(new MessageResponse("User not found"));

        List<Enrollment> enrollments = enrollmentRepository.findByUserId(user.getId());
        Enrollment currentEnrollment = null;
        for (Enrollment e : enrollments) {
            if (e.getCourse().getId().equals(courseId)) {
                currentEnrollment = e;
                break;
            }
        }

        if (currentEnrollment == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Enrollment not found"));
        }

        currentEnrollment.setStatus("COMPLETED");
        enrollmentRepository.save(currentEnrollment);

        // Generate Notification for the Student
        Notification completionNotification = new Notification("Congratulations! You have completed course '" + currentEnrollment.getCourse().getCourseName() + "'.");
        completionNotification.setUser(user);
        notificationRepository.save(completionNotification);

        return ResponseEntity.ok(new MessageResponse("Course marked as completed"));
    }
    @GetMapping("/all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }
}
