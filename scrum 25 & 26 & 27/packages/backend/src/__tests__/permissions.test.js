const request = require("supertest");
const app = require("../src/server");
const { signToken } = require("../src/middleware/auth.middleware");

// ── Token helpers ─────────────────────────────────────────────────────────────
const parentToken = () =>
  signToken({ id: "user-1", email: "parent@test.com", role: "parent" });
const judgeToken = () =>
  signToken({ id: "user-2", email: "judge@test.com", role: "judge" });
const adminToken = () =>
  signToken({ id: "user-3", email: "admin@test.com", role: "admin" });

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  it("returns a token for valid parent credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "parent@example.com", password: "parent123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe("parent");
  });

  it("returns 401 for invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "parent@example.com", password: "wrong" });

    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  APPLICATIONS – parent allowed
// ─────────────────────────────────────────────────────────────────────────────
describe("Applications – parent ALLOWED actions", () => {
  it("parent can submit an application", async () => {
    const res = await request(app)
      .post("/api/applications")
      .set(authHeader(parentToken()))
      .send({ childName: "Alice", grade: "5" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("pending");
  });

  it("parent can view their own applications", async () => {
    const res = await request(app)
      .get("/api/applications/my")
      .set(authHeader(parentToken()));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  APPLICATIONS – parent DENIED actions
// ─────────────────────────────────────────────────────────────────────────────
describe("Applications – parent DENIED actions", () => {
  it("parent cannot view ALL applications (judge/admin only)", async () => {
    const res = await request(app)
      .get("/api/applications")
      .set(authHeader(parentToken()));

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("parent cannot score an application", async () => {
    const res = await request(app)
      .put("/api/applications/app-001/score")
      .set(authHeader(parentToken()))
      .send({ score: 90 });

    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  RESULTS – parent allowed
// ─────────────────────────────────────────────────────────────────────────────
describe("Results – parent ALLOWED actions", () => {
  it("parent can view their own results", async () => {
    const res = await request(app)
      .get("/api/results/my")
      .set(authHeader(parentToken()));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  RESULTS – parent DENIED actions
// ─────────────────────────────────────────────────────────────────────────────
describe("Results – parent DENIED actions", () => {
  it("parent cannot view all results (admin only)", async () => {
    const res = await request(app)
      .get("/api/results")
      .set(authHeader(parentToken()));

    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN – parent DENIED
// ─────────────────────────────────────────────────────────────────────────────
describe("Admin – parent DENIED actions", () => {
  it("parent cannot access admin users list", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set(authHeader(parentToken()));

    expect(res.status).toBe(403);
  });

  it("parent cannot change user roles", async () => {
    const res = await request(app)
      .put("/api/admin/users/user-1/role")
      .set(authHeader(parentToken()))
      .send({ role: "admin" });

    expect(res.status).toBe(403);
  });

  it("parent cannot export data", async () => {
    const res = await request(app)
      .get("/api/admin/export")
      .set(authHeader(parentToken()));

    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  JUDGE permissions
// ─────────────────────────────────────────────────────────────────────────────
describe("Applications – judge permissions", () => {
  it("judge can view all applications", async () => {
    const res = await request(app)
      .get("/api/applications")
      .set(authHeader(judgeToken()));

    expect(res.status).toBe(200);
  });

  it("judge can score an application", async () => {
    const res = await request(app)
      .put("/api/applications/app-001/score")
      .set(authHeader(judgeToken()))
      .send({ score: 85, feedback: "Good application" });

    expect(res.status).toBe(200);
  });

  it("judge cannot access admin panel", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set(authHeader(judgeToken()));

    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN permissions
// ─────────────────────────────────────────────────────────────────────────────
describe("Admin – full access", () => {
  it("admin can access admin users list", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set(authHeader(adminToken()));

    expect(res.status).toBe(200);
  });

  it("admin can view all results", async () => {
    const res = await request(app)
      .get("/api/results")
      .set(authHeader(adminToken()));

    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  No token
// ─────────────────────────────────────────────────────────────────────────────
describe("Unauthenticated requests", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/applications/my");
    expect(res.status).toBe(401);
  });
});
