package com.app.security.config;

import com.app.security.filter.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // Enables @PreAuthorize on controller methods
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()

                // ADMIN — full access to everything
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")

                // JUDGE — can view cases and submit verdicts
                .requestMatchers(HttpMethod.GET,  "/api/cases/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_JUDGE")
                .requestMatchers(HttpMethod.POST, "/api/cases/*/verdict").hasAuthority("ROLE_JUDGE")

                // PARENT — can view their own child's records only
                .requestMatchers(HttpMethod.GET,  "/api/children/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_PARENT")

                // DOCUMENT_CONTROLLER — can upload and manage documents
                .requestMatchers("/api/documents/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCUMENT_CONTROLLER")

                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .accessDeniedHandler(accessDeniedHandler())
            )
            .addFilterBefore(jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Returns a JSON "Access Denied" response for role-permission failures.
     */
    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            PrintWriter writer = response.getWriter();
            writer.write("{\"error\": \"Access Denied\", \"message\": \"You do not have permission to access this resource.\"}");
            writer.flush();
            writer.close();
        };
    }
}
