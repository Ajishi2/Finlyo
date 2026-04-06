package com.finance.security;

import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

/**
 * Manages the current security context for the request.
 * This is stored in request scope so each request has its own context.
 */
@Component
@RequestScope
public class SecurityContextHolder {
    private SecurityContext context;

    public void setContext(SecurityContext context) {
        this.context = context;
    }

    public SecurityContext getContext() {
        if (context == null) {
            throw new RuntimeException("Security context not initialized");
        }
        return context;
    }

    public boolean isContextSet() {
        return context != null;
    }
}
