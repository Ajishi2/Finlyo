package com.finance.security;

import com.finance.entity.Role;
import com.finance.entity.User;

/**
 * SecurityContext holds information about the currently authenticated user.
 * In a real-world scenario, this would be populated from JWT tokens or session data.
 * For this assignment, we use header-based authentication for simplicity.
 */
public class SecurityContext {
    private User user;
    private Role role;
    private static UserContext currentUser;

    public SecurityContext(User user, Role role) {
        this.user = user;
        this.role = role;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    public boolean isAnalyst() {
        return role == Role.ANALYST;
    }

    public boolean isViewer() {
        return role == Role.VIEWER;
    }

    public Long getUserId() {
        return user.getId();
    }

    public static UserContext getCurrentUser() {
        return currentUser;
    }

    public static void setCurrentUser(UserContext userContext) {
        currentUser = userContext;
    }

    public static class UserContext {
        private Long userId;
        private String email;
        private String role;

        public UserContext(Long userId, String email, String role) {
            this.userId = userId;
            this.email = email;
            this.role = role;
        }

        public Long getUserId() {
            return userId;
        }

        public String getEmail() {
            return email;
        }

        public String getRole() {
            return role;
        }
    }
}
