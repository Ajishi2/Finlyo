package com.finance.controller;

import com.finance.dto.AuthResponse;
import com.finance.dto.LoginRequest;
import com.finance.dto.UserDto;
import com.finance.entity.User;
import com.finance.security.JwtUtil;
import com.finance.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/generate-hash")
    public ResponseEntity<?> generateHash(@RequestParam String password) {
        String hash = passwordEncoder.encode(password);
        return ResponseEntity.ok(Map.of(
            "password", password,
            "hash", hash
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // 1. find user by email
            User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // 2. verify password with BCrypt
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.status(401)
                    .body(new SimpleErrorResponse("AUTHENTICATION_FAILED", "Invalid email or password"));
            }
            
            // 3. generate JWT
            String token = jwtUtil.generateToken(
                user.getEmail(), 
                user.getRole().toString(), 
                user.getId()
            );
            
            // 4. return token + user object
            UserDto userDto = new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName() + " " + user.getLastName(),
                user.getRole().toString()
            );
            
            AuthResponse response = new AuthResponse(token, userDto);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(401)
                .body(new SimpleErrorResponse("AUTHENTICATION_FAILED", "Invalid email or password"));
        }
    }

    private static class SimpleErrorResponse {
        private String code;
        private String message;

        public SimpleErrorResponse(String code, String message) {
            this.code = code;
            this.message = message;
        }

        public String getCode() {
            return code;
        }

        public String getMessage() {
            return message;
        }
    }
}
