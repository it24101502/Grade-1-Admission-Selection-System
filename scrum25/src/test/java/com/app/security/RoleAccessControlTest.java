package com.app.security;

import com.app.security.enums.Role;
import com.app.security.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RoleAccessControlTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private String adminToken;
    private String judgeToken;
    private String parentToken;
    private String docControllerToken;

    @BeforeEach
    void setup() {
        adminToken      = "Bearer " + jwtService.generateToken("admin_user",      List.of(Role.ADMIN));
        judgeToken      = "Bearer " + jwtService.generateToken("judge_user",      List.of(Role.JUDGE));
        parentToken     = "Bearer " + jwtService.generateToken("parent_user",     List.of(Role.PARENT));
        docControllerToken = "Bearer " + jwtService.generateToken("doc_user",     List.of(Role.DOCUMENT_CONTROLLER));
    }

    // ─── ADMIN tests ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("ADMIN can access admin dashboard")
    void adminCanAccessDashboard() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                .header("Authorization", adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("JUDGE cannot access admin dashboard → 403")
    void judgeCannotAccessAdminDashboard() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                .header("Authorization", judgeToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Access Denied"));
    }

    @Test
    @DisplayName("PARENT cannot access admin dashboard → 403")
    void parentCannotAccessAdminDashboard() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                .header("Authorization", parentToken))
                .andExpect(status().isForbidden());
    }

    // ─── JUDGE tests ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("JUDGE can view cases")
    void judgeCanViewCases() throws Exception {
        mockMvc.perform(get("/api/cases/1")
                .header("Authorization", judgeToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("JUDGE can submit verdict")
    void judgeCanSubmitVerdict() throws Exception {
        mockMvc.perform(post("/api/cases/1/verdict")
                .header("Authorization", judgeToken)
                .contentType("application/json")
                .content("{\"verdict\": \"Approved\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PARENT cannot submit verdict → 403")
    void parentCannotSubmitVerdict() throws Exception {
        mockMvc.perform(post("/api/cases/1/verdict")
                .header("Authorization", parentToken)
                .contentType("application/json")
                .content("{\"verdict\": \"Approved\"}"))
                .andExpect(status().isForbidden());
    }

    // ─── PARENT tests ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("PARENT can view child records")
    void parentCanViewChildRecords() throws Exception {
        mockMvc.perform(get("/api/children/42")
                .header("Authorization", parentToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DOCUMENT_CONTROLLER cannot view child records → 403")
    void docControllerCannotViewChildRecords() throws Exception {
        mockMvc.perform(get("/api/children/42")
                .header("Authorization", docControllerToken))
                .andExpect(status().isForbidden());
    }

    // ─── DOCUMENT CONTROLLER tests ────────────────────────────────────────────

    @Test
    @DisplayName("DOCUMENT_CONTROLLER can upload documents")
    void docControllerCanUploadDocuments() throws Exception {
        mockMvc.perform(post("/api/documents/upload")
                .header("Authorization", docControllerToken)
                .contentType("application/json")
                .content("{\"fileName\": \"report.pdf\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PARENT cannot upload documents → 403")
    void parentCannotUploadDocuments() throws Exception {
        mockMvc.perform(post("/api/documents/upload")
                .header("Authorization", parentToken)
                .contentType("application/json")
                .content("{\"fileName\": \"report.pdf\"}"))
                .andExpect(status().isForbidden());
    }

    // ─── No token tests ───────────────────────────────────────────────────────

    @Test
    @DisplayName("No token returns 403 on protected route")
    void noTokenReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Invalid/expired token returns 403")
    void invalidTokenReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/cases/1")
                .header("Authorization", "Bearer invalid.token.here"))
                .andExpect(status().isForbidden());
    }
}
