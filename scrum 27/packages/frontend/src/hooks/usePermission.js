import { hasPermission, getPermissionsForRole } from "@school-portal/shared";
import { useAuth } from "../context/AuthContext";

/**
 * Hook that exposes permission helpers scoped to the logged-in user.
 *
 * Usage:
 *   const { can, cannot } = usePermission();
 *   if (can("submit_application")) { ... }
 */
export function usePermission() {
  const { user } = useAuth();
  const role = user?.role ?? null;

  const can = (permission) => {
    if (!role) return false;
    return hasPermission(role, permission);
  };

  const cannot = (permission) => !can(permission);

  const allPermissions = () => (role ? getPermissionsForRole(role) : []);

  return { can, cannot, allPermissions, role };
}
