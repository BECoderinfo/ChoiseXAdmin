import { request } from "./client";

export function loginAdmin(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function refreshAccessToken(refreshToken) {
  return request("/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function logoutAdmin() {
  return request("/auth/logout", {
    method: "POST",
  });
}

export function requestPasswordOtp(payload) {
  return request("/auth/forgot-password/send-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyPasswordOtp(payload) {
  return request("/auth/forgot-password/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resetAdminPassword(payload) {
  return request("/auth/forgot-password/reset", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


