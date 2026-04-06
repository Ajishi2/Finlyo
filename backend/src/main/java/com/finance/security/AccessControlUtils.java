package com.finance.security;

import com.finance.entity.Role;
import com.finance.exception.AccessDeniedException;

/**
 * AccessControlUtils provides methods to check permissions based on user roles.
 * This is the central place for access control logic.
 */
public class AccessControlUtils {

    /**
     * Check if a user can view financial records
     * VIEWER, ANALYST, and ADMIN can view
     */
    public static void checkCanViewRecords(Role role) {
        if (role == null) {
            throw new AccessDeniedException("User role not set");
        }
        // All roles can view (but filtered by their own records unless admin/analyst)
    }

    /**
     * Check if a user can create financial records
     * Only ANALYST and ADMIN can create
     */
    public static void checkCanCreateRecord(Role role) {
        if (role == Role.VIEWER) {
            throw new AccessDeniedException("Viewers cannot create financial records");
        }
        if (role == null) {
            throw new AccessDeniedException("User role not set");
        }
    }

    /**
     * Check if a user can update financial records
     * Only ANALYST (own records) and ADMIN (any records) can update
     */
    public static void checkCanUpdateRecord(Role role, Long createdByUserId, Long requestingUserId) {
        if (role == Role.VIEWER) {
            throw new AccessDeniedException("Viewers cannot update financial records");
        }

        if (role == Role.ANALYST) {
            if (!createdByUserId.equals(requestingUserId)) {
                throw new AccessDeniedException("Analysts can only update their own records");
            }
        }
        // ADMIN can update any record
    }

    /**
     * Check if a user can delete financial records
     * Only ANALYST (own records) and ADMIN (any records) can delete
     */
    public static void checkCanDeleteRecord(Role role, Long createdByUserId, Long requestingUserId) {
        if (role == Role.VIEWER) {
            throw new AccessDeniedException("Viewers cannot delete financial records");
        }

        if (role == Role.ANALYST) {
            if (!createdByUserId.equals(requestingUserId)) {
                throw new AccessDeniedException("Analysts can only delete their own records");
            }
        }
        // ADMIN can delete any record
    }

    /**
     * Check if a user can view other users
     * Only ADMIN can view all users, others can only view themselves
     */
    public static void checkCanViewUser(Role role, Long targetUserId, Long requestingUserId) {
        if (role != Role.ADMIN && !targetUserId.equals(requestingUserId)) {
            throw new AccessDeniedException("You can only view your own profile or be an admin");
        }
    }

    /**
     * Check if a user can manage users (create, update, delete)
     * Only ADMIN can manage users
     */
    public static void checkCanManageUsers(Role role) {
        if (role != Role.ADMIN) {
            throw new AccessDeniedException("Only administrators can manage users");
        }
    }

    /**
     * Check if a user can access summary/analytics
     * ANALYST and ADMIN can access
     */
    public static void checkCanAccessAnalytics(Role role) {
        if (role == Role.VIEWER) {
            throw new AccessDeniedException("Viewers cannot access detailed analytics");
        }
    }
}
