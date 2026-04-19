import { usePermission } from "../hooks/usePermission";

/**
 * Renders `children` only when the current user has the required permission.
 * Optionally renders a `fallback` element instead.
 *
 * @example
 * <PermissionGate permission="submit_application">
 *   <SubmitForm />
 * </PermissionGate>
 *
 * <PermissionGate permission="manage_users" fallback={<p>Access denied.</p>}>
 *   <AdminPanel />
 * </PermissionGate>
 */
export function PermissionGate({ permission, fallback = null, children }) {
  const { can } = usePermission();

  if (!can(permission)) return fallback;
  return children;
}
