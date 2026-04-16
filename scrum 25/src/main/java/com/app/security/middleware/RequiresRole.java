package com.app.security.middleware;

import com.app.security.enums.Role;
import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.*;

/**
 * Convenience annotation for role-based access control.
 * Use on any controller method instead of repeating @PreAuthorize strings.
 *
 * Usage:
 *   @RequiresRole(Role.ADMIN)
 *   @RequiresRole({Role.ADMIN, Role.JUDGE})
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresRole {
    Role[] value();
}
