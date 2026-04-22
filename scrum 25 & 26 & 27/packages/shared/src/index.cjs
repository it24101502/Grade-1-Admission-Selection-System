// CommonJS entry — used by backend (Node) and Jest tests
"use strict";

const ROLES = {
  PARENT: "parent",
  JUDGE: "judge",
  ADMIN: "admin",
};

const PERMISSIONS = {
  SUBMIT_APPLICATION:    "submit_application",
  VIEW_OWN_APPLICATION:  "view_own_application",
  VIEW_OWN_RESULTS:      "view_own_results",
  REVIEW_APPLICATIONS:   "review_applications",
  SCORE_APPLICATION:     "score_application",
  VIEW_ALL_APPLICATIONS: "view_all_applications",
  MANAGE_USERS:          "manage_users",
  MANAGE_ROLES:          "manage_roles",
  VIEW_ALL_RESULTS:      "view_all_results",
  CONFIGURE_SYSTEM:      "configure_system",
  EXPORT_DATA:           "export_data",
};

const ROLE_PERMISSIONS = {
  [ROLES.PARENT]: [
    PERMISSIONS.SUBMIT_APPLICATION,
    PERMISSIONS.VIEW_OWN_APPLICATION,
    PERMISSIONS.VIEW_OWN_RESULTS,
  ],
  [ROLES.JUDGE]: [
    PERMISSIONS.REVIEW_APPLICATIONS,
    PERMISSIONS.SCORE_APPLICATION,
    PERMISSIONS.VIEW_ALL_APPLICATIONS,
    PERMISSIONS.VIEW_OWN_RESULTS,
  ],
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
};

function hasPermission(role, permission) {
  return (ROLE_PERMISSIONS[role] ?? []).includes(permission);
}

function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] ?? [];
}

module.exports = { ROLES, PERMISSIONS, ROLE_PERMISSIONS, hasPermission, getPermissionsForRole };
