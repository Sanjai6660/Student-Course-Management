package com.example.coursemanagement.security;

import com.example.coursemanagement.entity.User;
import com.example.coursemanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@academia.com")) {
            User admin = new User();
            admin.setName("System Administrator");
            admin.setEmail("admin@academia.com");
            admin.setPassword(encoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN");
            userRepository.save(admin);
            System.out.println("Seeded initial admin: admin@academia.com / admin123");
        }
    }
}
