// Scrum-28: Role constants - frontend copy (avoids CJS/ESM conflict with shared workspace)
export const ROLES = {
  ADMIN: "Admin",
  JUDGE: "Judge",
  PARENT: "Parent",
  DOCUMENT_CONTROLLER: "DocumentController",
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: [
    "dashboard:admin", "dashboard:view",
    "users:read", "users:write", "users:delete",
    "applications:read", "applications:write", "applications:delete",
    "results:read", "results:write",
    "categories:read", "categories:write",
    "documents:read", "documents:write",
  ],
  [ROLES.JUDGE]: [
    "dashboard:judge", "dashboard:view",
    "applications:read", "results:read", "results:write", "categories:read",
  ],
  [ROLES.PARENT]: [
    "dashboard:parent",
    "applications:read", "applications:submit",
    "results:read", "categories:read",
  ],
  [ROLES.DOCUMENT_CONTROLLER]: [
    "dashboard:doccontroller", "dashboard:view",
    "documents:read", "documents:write", "documents:verify",
    "applications:read", "categories:read",
  ],
};

export const CATEGORY_RESTRICTED_ROLES = [ROLES.PARENT];
