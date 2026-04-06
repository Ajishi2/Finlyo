package com.finance.controller;

import com.finance.dto.ApiResponse;
import com.finance.dto.UserCreateRequest;
import com.finance.dto.UserResponse;
import com.finance.dto.UserUpdateRequest;
import com.finance.entity.Role;
import com.finance.entity.UserStatus;
import com.finance.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import java.util.List;

/**
 * User Management Controller
 * Handles user-related operations: create, read, update, delete
 */
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Health check endpoint (public)
     * GET /api/v1/users/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "message", "User API is running",
            "timestamp", java.time.Instant.now()
        ));
    }

    /**
     * Create a new user (ADMIN only)
     * POST /api/v1/users
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "User created successfully"));
    }

    /**
     * Get current user profile
     * GET /api/v1/users/profile
     */
    @GetMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserProfile(@PathVariable Long userId) {
        UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.ok(response, "User retrieved successfully"));
    }

    /**
     * Get user by email (ADMIN only)
     * GET /api/v1/users/email/{email}
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(@PathVariable String email) {
        UserResponse response = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.ok(response, "User retrieved successfully"));
    }

    /**
     * Get all users (ADMIN only)
     * GET /api/v1/users
     */
    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<UserResponse> users = userService.getAllUsers(page, size);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            throw e;
        }
    }

    /**
     * Update user details (ADMIN only)
     * PUT /api/v1/users/{userId}
     */
    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "User updated successfully"));
    }

    /**
     * Update user role (ADMIN only)
     * PATCH /api/v1/users/{userId}/role
     */
    @PatchMapping("/{userId}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable Long userId,
            @RequestParam Role role) {
        UserResponse response = userService.updateUserRole(userId, role);
        return ResponseEntity.ok(ApiResponse.ok(response, "User role updated successfully"));
    }

    /**
     * Update user status (ADMIN only)
     * PATCH /api/v1/users/{userId}/status
     */
    @PatchMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long userId,
            @RequestParam UserStatus status) {
        UserResponse response = userService.updateUserStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.ok(response, "User status updated successfully"));
    }

    /**
     * Reset user password (ADMIN only)
     * PATCH /api/v1/users/{userId}/password
     */
    @PatchMapping("/{userId}/password")
    public ResponseEntity<ApiResponse<UserResponse>> resetUserPassword(
            @PathVariable Long userId,
            @RequestParam String newPassword) {
        UserResponse response = userService.resetUserPassword(userId, newPassword);
        return ResponseEntity.ok(ApiResponse.ok(response, "User password reset successfully"));
    }

    /**
     * Delete user (ADMIN only - soft delete)
     * DELETE /api/v1/users/{userId}
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "User deleted successfully"));
    }
}
