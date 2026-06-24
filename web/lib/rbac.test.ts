import { describe, expect, it } from "vitest";
import { canAccessRolePath, getRoleHome } from "@/lib/rbac";

describe("rbac", () => {
  it("returns role home paths", () => {
    expect(getRoleHome("GUEST")).toBe("/portal/guest");
    expect(getRoleHome("STAFF")).toBe("/portal/staff");
  });

  it("blocks staff from admin routes", () => {
    expect(canAccessRolePath("STAFF", "/portal/admin/users")).toBe(false);
    expect(canAccessRolePath("STAFF", "/portal/staff/applications")).toBe(true);
  });

  it("allows admin everywhere", () => {
    expect(canAccessRolePath("ADMIN", "/portal/admin/settings")).toBe(true);
    expect(canAccessRolePath("ADMIN", "/portal/staff/messages")).toBe(true);
  });
});
