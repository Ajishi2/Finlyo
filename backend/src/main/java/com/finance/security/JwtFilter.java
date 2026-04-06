package com.finance.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.finance.entity.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private com.finance.security.SecurityContextHolder customSecurityContextHolder;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String requestTokenHeader = request.getHeader("Authorization");

        String email = null;
        String jwtToken = null;
        String role = null;

        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                email = jwtUtil.getEmailFromToken(jwtToken);
                role = jwtUtil.getRoleFromToken(jwtToken);
            } catch (Exception e) {
                logger.warn("Unable to get JWT Token");
            }
        }

        if (email != null && org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(jwtToken)) {
                try {
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(
                            email, 
                            null, 
                            List.of(new SimpleGrantedAuthority("ROLE_" + role))
                        );
                    org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    // Set custom security context
                    SecurityContext customContext = new SecurityContext(null, Role.valueOf(role));
                    customSecurityContextHolder.setContext(customContext);
                    com.finance.security.SecurityContext.setCurrentUser(new com.finance.security.SecurityContext.UserContext(
                        jwtUtil.getUserIdFromToken(jwtToken),
                        email,
                        role
                    ));
                } catch (Exception e) {
                    logger.error("Error setting authentication: " + e.getMessage());
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
