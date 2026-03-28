package com.example.coursemanagement.controller;

import com.example.coursemanagement.entity.User;
import com.example.coursemanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import com.example.coursemanagement.payload.response.MessageResponse;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/{id}/block")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> toggleBlockUser(@PathVariable long id) {
        return userRepository.findById(id).map(user -> {
            user.setBlocked(!user.isBlocked());
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("User block status updated"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
