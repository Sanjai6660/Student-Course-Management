package com.example.coursemanagement.repository;

import com.example.coursemanagement.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
}
