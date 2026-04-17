// src/__tests__/applications.test.js
const request = require("supertest");
const app     = require("../server/index");

let tokenAlice, tokenBob, tokenAdmin;

beforeAll(async () => {
  const alice = await request(app).post("/api/auth/login").send({ email: "alice@example.com", password: "password123" });
  tokenAlice = alice.body.token;

  const bob = await request(app).post("/api/auth/login").send({ email: "bob@example.com", password: "password123" });
  tokenBob = bob.body.token;

  const admin = await request(app).post("/api/auth/login").send({ email: "admin@example.com", password: "adminpass" });
  tokenAdmin = admin.body.token;
});

// ── Auth ────────────────────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  it("returns token + user on valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "alice@example.com", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.category).toBe("school_zone");
  });
  it("401 on wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "alice@example.com", password: "wrong" });
    expect(res.status).toBe(401);
  });
  it("400 when fields missing", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "alice@example.com" });
    expect(res.status).toBe(400);
  });
});

// ── AC1: User sees only their category ──────────────────────────────────────
describe("GET /api/applications — category filtering", () => {
  it("Alice sees only school_zone apps", async () => {
    const res = await request(app).get("/api/applications").set("Authorization", `Bearer ${tokenAlice}`);
    expect(res.status).toBe(200);
    const cats = [...new Set(res.body.applications.map((a) => a.category))];
    expect(cats).toEqual(["school_zone"]);
  });
  it("Bob sees only eligibility_type_a apps", async () => {
    const res = await request(app).get("/api/applications").set("Authorization", `Bearer ${tokenBob}`);
    expect(res.status).toBe(200);
    const cats = [...new Set(res.body.applications.map((a) => a.category))];
    expect(cats).toEqual(["eligibility_type_a"]);
  });
  it("401 with no token", async () => {
    const res = await request(app).get("/api/applications");
    expect(res.status).toBe(401);
  });
});

// ── AC2: Cross-category access denied ───────────────────────────────────────
describe("GET /api/applications — cross-category blocked", () => {
  it("Alice cannot request eligibility_type_a via ?category=", async () => {
    const res = await request(app).get("/api/applications?category=eligibility_type_a").set("Authorization", `Bearer ${tokenAlice}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Access denied/);
  });
  it("Bob cannot access a school_zone app by ID", async () => {
    const res = await request(app).get("/api/applications/app1").set("Authorization", `Bearer ${tokenBob}`);
    expect(res.status).toBe(403);
  });
});

// ── Admin ────────────────────────────────────────────────────────────────────
describe("GET /api/applications — admin", () => {
  it("Admin sees all apps", async () => {
    const res = await request(app).get("/api/applications").set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body.applications.length).toBeGreaterThan(3);
  });
  it("Admin can filter by category", async () => {
    const res = await request(app).get("/api/applications?category=school_zone").set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    const cats = [...new Set(res.body.applications.map((a) => a.category))];
    expect(cats).toEqual(["school_zone"]);
  });
  it("Admin can access any app by ID", async () => {
    const res = await request(app).get("/api/applications/app4").set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
  });
});

// ── 404 ──────────────────────────────────────────────────────────────────────
describe("GET /api/applications/:id", () => {
  it("404 for unknown ID", async () => {
    const res = await request(app).get("/api/applications/unknown").set("Authorization", `Bearer ${tokenAlice}`);
    expect(res.status).toBe(404);
  });
});
