package com.app.security.service;

import com.app.security.enums.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleValidationService {

    /**
     * Returns the roles of the currently authenticated user.
     */
    public List<String> getCurrentUserRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return List.of();
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
    }

    /**
     * Returns true if the current user has ALL of the specified roles.
     */
    public boolean hasAllRoles(Role... roles) {
        List<String> userRoles = getCurrentUserRoles();
        return Arrays.stream(roles)
                .allMatch(role -> userRoles.contains("ROLE_" + role.name()));
    }

    /**
     * Returns true if the current user has AT LEAST ONE of the specified roles.
     */
    public boolean hasAnyRole(Role... roles) {
        List<String> userRoles = getCurrentUserRoles();
        return Arrays.stream(roles)
                .anyMatch(role -> userRoles.contains("ROLE_" + role.name()));
    }

    /**
     * Throws AccessDeniedException if the current user does not have the required role.
     */
    public void enforceRole(Role... roles) {
        if (!hasAnyRole(roles)) {
            throw new org.springframework.security.access.AccessDeniedException(
                "Access Denied: insufficient role privileges."
            );
        }
    }

    /**
     * Returns the username of the currently authenticated user.
     */
    public String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? auth.getName() : null;
    }
}
