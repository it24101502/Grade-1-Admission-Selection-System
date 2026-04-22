import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS } from "@school-portal/shared";

// Mock AuthContext per role
function mockAuth(role) {
  vi.mock("../context/AuthContext", () => ({
    useAuth: () => ({ user: role ? { id: "u1", email: "t@t.com", role } : null }),
  }));
}

describe("usePermission – parent role", () => {
  beforeEach(() => mockAuth("parent"));

  it("can submit_application", () => {
    const { result } = renderHook(() => usePermission());
    expect(result.current.can(PERMISSIONS.SUBMIT_APPLICATION)).toBe(true);
  });

  it("can view_own_results", () => {
    const { result } = renderHook(() => usePermission());
    expect(result.current.can(PERMISSIONS.VIEW_OWN_RESULTS)).toBe(true);
  });

  it("cannot manage_users", () => {
    const { result } = renderHook(() => usePermission());
    expect(result.current.cannot(PERMISSIONS.MANAGE_USERS)).toBe(true);
  });

  it("cannot review_applications", () => {
    const { result } = renderHook(() => usePermission());
    expect(result.current.cannot(PERMISSIONS.REVIEW_APPLICATIONS)).toBe(true);
  });

  it("cannot score_application", () => {
    const { result } = renderHook(() => usePermission());
    expect(result.current.cannot(PERMISSIONS.SCORE_APPLICATION)).toBe(true);
  });

  it("cannot view_all_applications", () => {
    const { result } = renderHook(() => usePermission());
    expect(result.current.cannot(PERMISSIONS.VIEW_ALL_APPLICATIONS)).toBe(true);
  });
});

describe("usePermission – admin role", () => {
  beforeEach(() => mockAuth("admin"));

  it("can do everything", () => {
    const { result } = renderHook(() => usePermission());
    Object.values(PERMISSIONS).forEach((p) => {
      expect(result.current.can(p)).toBe(true);
    });
  });
});

describe("usePermission – no user", () => {
  beforeEach(() => mockAuth(null));

  it("can() always returns false", () => {
    const { result } = renderHook(() => usePermission());
    expect(result.current.can(PERMISSIONS.SUBMIT_APPLICATION)).toBe(false);
  });
});
