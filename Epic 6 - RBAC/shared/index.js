// Scrum-28: Define roles (Admin, Judge, Parent, Document Controller)
const ROLES = {
  ADMIN: "Admin",
  JUDGE: "Judge",
  PARENT: "Parent",
  DOCUMENT_CONTROLLER: "DocumentController",
};

// Scrum-25: Permission definitions per role
const PERMISSIONS = {
  [ROLES.ADMIN]: [
    "dashboard:admin",
    "dashboard:view",
    "users:read",
    "users:write",
    "users:delete",
    "applications:read",
    "applications:write",
    "applications:delete",
    "results:read",
    "results:write",
    "categories:read",
    "categories:write",
    "documents:read",
    "documents:write",
  ],
  [ROLES.JUDGE]: [
    "dashboard:judge",
    "dashboard:view",
    "applications:read",
    "results:read",
    "results:write",
    "categories:read",
  ],
  [ROLES.PARENT]: [
    "dashboard:parent",
    "applications:read",
    "applications:submit",
    "results:read",
    "categories:read",
  ],
  [ROLES.DOCUMENT_CONTROLLER]: [
    "dashboard:doccontroller",
    "dashboard:view",
    "documents:read",
    "documents:write",
    "documents:verify",
    "applications:read",
    "categories:read",
  ],
};

const CATEGORY_RESTRICTED_ROLES = [ROLES.PARENT];

// Support both CJS (backend) and ESM (frontend via Vite)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ROLES, PERMISSIONS, CATEGORY_RESTRICTED_ROLES };
}

export { ROLES, PERMISSIONS, CATEGORY_RESTRICTED_ROLES };
