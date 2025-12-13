import { request } from "./client";

// Admin: fetch users with order count and total spent
export function fetchAdminUsers() {
  return request("/admin/users", { method: "GET" });
}


