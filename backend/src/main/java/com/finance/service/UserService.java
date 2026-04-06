package com.finance.service;

import com.finance.dto.UserCreateRequest;
import com.finance.dto.UserResponse;
import com.finance.dto.UserUpdateRequest;
import com.finance.entity.Role;
import com.finance.entity.User;
import com.finance.entity.UserStatus;
import com.finance.exception.AccessDeniedException;
import com.finance.exception.DuplicateResourceException;
import com.finance.exception.ResourceNotFoundException;
import com.finance.repository.UserRepository;
import com.finance.security.AccessControlUtils;
import com.finance.security.SecurityContext;
import com.finance.security.SecurityContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final SecurityContextHolder securityContextHolder;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, SecurityContextHolder securityContextHolder) {
        this.userRepository = userRepository;
        this.securityContextHolder = securityContextHolder;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Create a new user (ADMIN only)
     */
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        var context = securityContextHolder.getContext();
        AccessControlUtils.checkCanManageUsers(context.getRole());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User with email " + request.getEmail() + " already exists");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Hash the password
                .role(request.getRole() != null ? request.getRole() : Role.VIEWER)
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);
        
        // Get current user for audit
        var currentUser = SecurityContext.getCurrentUser();
        
        // Audit log for user creation
        System.out.println("ADMIN AUDIT: New user created with ID " + user.getId() + 
                             ", email: " + user.getEmail() + 
                             ", role: " + user.getRole() + 
                             " by " + currentUser.getEmail());
        
        return mapToResponse(user);
    }

    /**
     * Get user by ID (users can view themselves, admins can view anyone)
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        var context = securityContextHolder.getContext();
        AccessControlUtils.checkCanViewUser(context.getRole(), userId, context.getUserId());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " not found"));

        return mapToResponse(user);
    }

    /**
     * Get user by email (ADMIN only)
     */
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        var context = securityContextHolder.getContext();
        AccessControlUtils.checkCanManageUsers(context.getRole());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User with email " + email + " not found"));

        return mapToResponse(user);
    }

    /**
     * Get all users (ADMIN only)
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(int page, int size) {
        var context = securityContextHolder.getContext();
        AccessControlUtils.checkCanManageUsers(context.getRole());

        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepository.findAll(pageable);
        
        return userPage.map(this::mapToResponse);
    }

    /**
     * Update user (ADMIN only)
     */
    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        var context = securityContextHolder.getContext();
        AccessControlUtils.checkCanManageUsers(context.getRole());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " not found"));

        // Track changes for audit
        StringBuilder changes = new StringBuilder();
        
        // Get current user for audit
        var currentUser = SecurityContext.getCurrentUser();
        
        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            if (!request.getFirstName().equals(user.getFirstName())) {
                changes.append("firstName: '").append(user.getFirstName()).append("' -> '").append(request.getFirstName()).append("', ");
            }
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            if (!request.getLastName().equals(user.getLastName())) {
                changes.append("lastName: '").append(user.getLastName()).append("' -> '").append(request.getLastName()).append("', ");
            }
            user.setLastName(request.getLastName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Email " + request.getEmail() + " is already in use");
            }
            if (!request.getEmail().equals(user.getEmail())) {
                changes.append("email: '").append(user.getEmail()).append("' -> '").append(request.getEmail()).append("', ");
            }
            user.setEmail(request.getEmail());
        }

        // Log the update if there were changes
        if (changes.length() > 0) {
            System.out.println("ADMIN AUDIT: User " + userId + " updated by " + currentUser.getEmail() + 
                             ". Changes: " + changes.substring(0, changes.length() - 2));
        }

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    /**
     * Update user role (ADMIN only)
     */
    @Transactional
    public UserResponse updateUserRole(Long userId, Role newRole) {
        var context = securityContextHolder.getContext();
        AccessControlUtils.checkCanManageUsers(context.getRole());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " not found"));

        Role oldRole = user.getRole();
        user.setRole(newRole);
        user = userRepository.save(user);
        
        // Get current user for audit
        var currentUser = SecurityContext.getCurrentUser();
        
        // Audit log for role change
        System.out.println("ADMIN AUDIT: User " + userId + " role changed from " + oldRole + 
                             " to " + newRole + " by " + currentUser.getEmail());
        
        return mapToResponse(user);
    }

    /**
     * Update user status (ADMIN only)
     */
    @Transactional
    public UserResponse updateUserStatus(Long userId, UserStatus newStatus) {
        var context = securityContextHolder.getContext();
        AccessControlUtils.checkCanManageUsers(context.getRole());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " not found"));

        UserStatus oldStatus = user.getStatus();
        user.setStatus(newStatus);
        user = userRepository.save(user);
        
        // Get current user for audit
        var currentUser = SecurityContext.getCurrentUser();
        
        // Audit log for status change
        System.out.println("ADMIN AUDIT: User " + userId + " status changed from " + oldStatus + 
                             " to " + newStatus + " by " + currentUser.getEmail());
        
        return mapToResponse(user);
    }

    /**
     * Reset user password (ADMIN only)
     */
    @Transactional
    public UserResponse resetUserPassword(Long userId, String newPassword) {
        var context = securityContextHolder.getContext();
        AccessControlUtils.checkCanManageUsers(context.getRole());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " not found"));

        user.setPassword(passwordEncoder.encode(newPassword)); // Hash the new password
        user = userRepository.save(user);
        
        // Get current user for audit
        var currentUser = SecurityContext.getCurrentUser();
        
        // Audit log for password reset
        System.out.println("ADMIN AUDIT: Password reset for user " + userId + 
                             " (" + user.getEmail() + ") by " + currentUser.getEmail());
        
        return mapToResponse(user);
    }

    /**
     * Delete user (soft delete - ADMIN only)
     */
    @Transactional
    public void deleteUser(Long userId) {
        var context = securityContextHolder.getContext();
        AccessControlUtils.checkCanManageUsers(context.getRole());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " not found"));

        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
        
        // Get current user for audit
        var currentUser = SecurityContext.getCurrentUser();
        
        // Audit log for soft delete
        System.out.println("ADMIN AUDIT: User " + userId + " soft deleted by " + currentUser.getEmail());
    }

    /**
     * Find user by email (for authentication)
     */
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Authenticate user (mock authentication for this assignment)
     * In production, would verify password hash
     */
    @Transactional(readOnly = true)
    public User authenticateUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        // Mock authentication - in production, use bcrypt or similar
        if (!user.getPassword().equals(password)) {
            throw new ResourceNotFoundException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new AccessDeniedException("User account is not active");
        }

        return user;
    }

    /**
     * Map User entity to UserResponse DTO
     */
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
