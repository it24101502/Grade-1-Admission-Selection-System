# Scrum 25 — Role-Based Access Control (RBAC)

Sprint 4 | Backend Security | Spring Boot + JWT

---

## 📌 User Story
> As a system, I want to control user access based on roles so that security is enforced across the platform.

---

## 🏗 Architecture

```
src/main/java/com/app/
├── security/
│   ├── config/
│   │   └── SecurityConfig.java          ← Spring Security filter chain + route rules
│   ├── enums/
│   │   └── Role.java                    ← ADMIN, JUDGE, PARENT, DOCUMENT_CONTROLLER
│   ├── filter/
│   │   └── JwtAuthenticationFilter.java ← Intercepts every request, validates JWT
│   ├── middleware/
│   │   └── RequiresRole.java            ← Custom annotation for method-level control
│   └── service/
│       ├── JwtService.java              ← Token generation, parsing, validation
│       └── RoleValidationService.java   ← Programmatic role checks
└── controller/
    └── RoleAccessController.java        ← Demo endpoints per role
```

---

## 🔐 Role Permissions Matrix

| Endpoint                        | ADMIN | JUDGE | PARENT | DOC_CONTROLLER |
|---------------------------------|:-----:|:-----:|:------:|:--------------:|
| `GET  /api/admin/dashboard`     |  ✅   |  ❌   |   ❌   |      ❌        |
| `DELETE /api/admin/users/{id}`  |  ✅   |  ❌   |   ❌   |      ❌        |
| `GET  /api/cases/{id}`          |  ✅   |  ✅   |   ❌   |      ❌        |
| `POST /api/cases/{id}/verdict`  |  ❌   |  ✅   |   ❌   |      ❌        |
| `GET  /api/children/{id}`       |  ✅   |  ❌   |   ✅   |      ❌        |
| `POST /api/documents/upload`    |  ✅   |  ❌   |   ❌   |      ✅        |
| `GET  /api/documents/{id}`      |  ✅   |  ✅   |   ❌   |      ✅        |

---

## ⚙️ How It Works

### 1. JWT Filter (`JwtAuthenticationFilter`)
Runs **before** every request. Extracts the `Authorization: Bearer <token>` header, validates it, and loads the user's roles into the Spring `SecurityContext`.

### 2. Security Config (`SecurityConfig`)
Defines URL-level role rules using `.authorizeHttpRequests()`. Returns a JSON `Access Denied` response (not a redirect) when role permission fails.

### 3. Method-Level (`@PreAuthorize`)
Controllers use `@PreAuthorize("hasRole('JUDGE')")` for fine-grained control on individual endpoints.

### 4. Programmatic Checks (`RoleValidationService`)
For logic inside service methods, inject `RoleValidationService` and call `enforceRole(Role.JUDGE)`.

---

## 🚀 Running the App

```bash
# Clone and build
mvn clean install

# Run
mvn spring-boot:run
```

---

## 🧪 Running Tests

```bash
mvn test
```

Tests cover:
- ✅ Each role accessing its permitted endpoints
- ❌ Each role being blocked from unpermitted endpoints
- ❌ No token → 403
- ❌ Invalid token → 403

---

## 🔑 JWT Configuration

Set in `application.yml`:
```yaml
jwt:
  secret: YourSuperSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm
  expiration: 86400000   # 24 hours
```

> ⚠️ In production, store `jwt.secret` in environment variables or a secrets manager — never commit it to Git.

---

## ✔️ Acceptance Criteria Coverage

| Criteria | Implementation |
|----------|---------------|
| Access granted only if role matches | `SecurityConfig` + `@PreAuthorize` |
| Returns "Access Denied" on failure | `AccessDeniedHandler` + `JwtAuthenticationFilter` |
| Middleware / interceptor implemented | `JwtAuthenticationFilter` (OncePerRequestFilter) |
| Role validation logic completed | `RoleValidationService` |
| Tested with all roles | `RoleAccessControlTest` |
| No unauthorized access possible | Stateless JWT, no session, 403 on all failures |
