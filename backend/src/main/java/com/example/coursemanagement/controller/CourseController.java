package com.example.coursemanagement.controller;

import com.example.coursemanagement.entity.Course;
import com.example.coursemanagement.repository.CourseRepository;
import com.example.coursemanagement.payload.response.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.lang.NonNull;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    CourseRepository courseRepository;

    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createCourse(@NonNull @RequestBody Course course) {
        Course savedCourse = courseRepository.save(course);
        return ResponseEntity.ok(savedCourse);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateCourse(@PathVariable long id, @NonNull @RequestBody Course courseDetails) {
        return courseRepository.findById(id)
                .<ResponseEntity<?>>map(course -> {
                    course.setCourseName(courseDetails.getCourseName());
                    course.setDescription(courseDetails.getDescription());
                    course.setImageUrl(courseDetails.getImageUrl());
                    courseRepository.save(course);
                    return ResponseEntity.ok(new MessageResponse("Course updated successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable long id) {
        if (courseRepository.existsById(id)) {
            courseRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Course deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
