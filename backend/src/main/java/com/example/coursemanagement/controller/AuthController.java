package com.example.coursemanagement.controller;

import com.example.coursemanagement.entity.User;
import com.example.coursemanagement.payload.request.LoginRequest;
import com.example.coursemanagement.payload.request.SignupRequest;
import com.example.coursemanagement.payload.response.JwtResponse;
import com.example.coursemanagement.payload.response.MessageResponse;
import com.example.coursemanagement.repository.UserRepository;
import com.example.coursemanagement.security.jwt.JwtUtils;
import com.example.coursemanagement.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        String identifier = loginRequest.getEmail(); // frontend sends identifier in "email" field
        System.out.println("Processing login for identifier: " + identifier);

        // Resolve to email: check if it looks like a reg number (dept prefix + 6 digits)
        String resolvedEmail = identifier;
        if (identifier != null && identifier.matches("^(CSE|ME|ECE|EEE)\\d{6}$")) {
            java.util.Optional<User> byReg = userRepository.findByRegNumber(identifier);
            if (byReg.isPresent()) {
                resolvedEmail = byReg.get().getEmail();
            } else {
                return ResponseEntity.status(401).body(new MessageResponse("Error: Registration number not found."));
            }
        }

        java.util.Optional<User> optionalUser = userRepository.findByEmail(resolvedEmail);
        if (optionalUser.isPresent() && optionalUser.get().isBlocked()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User account is blocked."));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(resolvedEmail, loginRequest.getPassword()));
            System.out.println("Authentication successful for: " + resolvedEmail);

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String role = userDetails.getAuthorities().iterator().next().getAuthority();

            return ResponseEntity.ok(new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getName(),
                    userDetails.getEmail(),
                    role));
        } catch (org.springframework.security.core.AuthenticationException e) {
            System.out.println("Authentication failed for: " + resolvedEmail + " - " + e.getMessage());
            return ResponseEntity.status(401).body(new MessageResponse("Error: Invalid credentials."));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Validate reg number for student accounts
        String role = signUpRequest.getRole();
        if (role == null || role.isEmpty()) role = "ROLE_STUDENT";

        if ("ROLE_STUDENT".equals(role)) {
            String regNum = signUpRequest.getRegNumber();
            if (regNum == null || !regNum.matches("^(CSE|ME|ECE|EEE)\\d{6}$")) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Invalid registration number. Format: DEPT + 6 digits (e.g. CSE123456)"));
            }
            if (Boolean.TRUE.equals(userRepository.existsByRegNumber(regNum))) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Registration number already exists!"));
            }
        }

        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());

        String rawPassword = signUpRequest.getPassword();
        System.out.println("Signup raw password from request: [" + rawPassword + "]");

        String hash = encoder.encode(rawPassword);
        System.out.println("Computed BCrypt hash: [" + hash + "]");

        user.setPassword(hash);
        System.out.println("User object password value: [" + user.getPassword() + "]");

        // Security check: Only admins can create other admins, unless it's the first user
        if ("ROLE_ADMIN".equals(role)) {
            long userCount = userRepository.count();
            if (userCount > 0) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                boolean isCurrentAdmin = auth != null && auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

                if (!isCurrentAdmin) {
                    role = "ROLE_STUDENT";
                }
            }
        }

        user.setRole(role);
        if ("ROLE_STUDENT".equals(role) && signUpRequest.getRegNumber() != null) {
            user.setRegNumber(signUpRequest.getRegNumber());
        }

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody LoginRequest loginRequest) {
        return userRepository.findByEmail(loginRequest.getEmail()).map(user -> {
            System.out.println("Password reset link: http://localhost:5173/reset-password?token=" + user.getId());
            return ResponseEntity.ok(new MessageResponse("Password reset link generated in console."));
        }).orElse(ResponseEntity.badRequest().body(new MessageResponse("Error: Email not found.")));
    }
}
