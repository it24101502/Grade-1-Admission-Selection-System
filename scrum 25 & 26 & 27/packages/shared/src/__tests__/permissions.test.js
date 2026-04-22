const {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  getPermissionsForRole,
} = require("../src/permissions");

describe("ROLE_PERMISSIONS – parent", () => {
  const parentPerms = ROLE_PERMISSIONS[ROLES.PARENT];

  it("has exactly 3 permissions", () => {
    expect(parentPerms).toHaveLength(3);
  });

  it("includes submit_application", () => {
    expect(parentPerms).toContain(PERMISSIONS.SUBMIT_APPLICATION);
  });

  it("includes view_own_application", () => {
    expect(parentPerms).toContain(PERMISSIONS.VIEW_OWN_APPLICATION);
  });

  it("includes view_own_results", () => {
    expect(parentPerms).toContain(PERMISSIONS.VIEW_OWN_RESULTS);
  });

  it("does NOT include manage_users", () => {
    expect(parentPerms).not.toContain(PERMISSIONS.MANAGE_USERS);
  });

  it("does NOT include review_applications", () => {
    expect(parentPerms).not.toContain(PERMISSIONS.REVIEW_APPLICATIONS);
  });

  it("does NOT include score_application", () => {
    expect(parentPerms).not.toContain(PERMISSIONS.SCORE_APPLICATION);
  });
});

describe("hasPermission()", () => {
  it("returns true for parent + submit_application", () => {
    expect(hasPermission(ROLES.PARENT, PERMISSIONS.SUBMIT_APPLICATION)).toBe(true);
  });

  it("returns false for parent + manage_users", () => {
    expect(hasPermission(ROLES.PARENT, PERMISSIONS.MANAGE_USERS)).toBe(false);
  });

  it("returns false for unknown role", () => {
    expect(hasPermission("ghost", PERMISSIONS.SUBMIT_APPLICATION)).toBe(false);
  });

  it("admin has every permission", () => {
    Object.values(PERMISSIONS).forEach((p) => {
      expect(hasPermission(ROLES.ADMIN, p)).toBe(true);
    });
  });
});

describe("getPermissionsForRole()", () => {
  it("returns empty array for unknown role", () => {
    expect(getPermissionsForRole("ghost")).toEqual([]);
  });

  it("returns all permissions for admin", () => {
    const adminPerms = getPermissionsForRole(ROLES.ADMIN);
    expect(adminPerms.length).toBe(Object.values(PERMISSIONS).length);
  });
});
