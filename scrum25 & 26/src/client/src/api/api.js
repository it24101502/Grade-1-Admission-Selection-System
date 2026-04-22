// src/client/api/api.js
const BASE = process.env.REACT_APP_API_URL || "";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  login:              (email, password) => request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getApplications:    ()    => request("/api/applications"),
  getApplicationById: (id)  => request(`/api/applications/${id}`),
};
