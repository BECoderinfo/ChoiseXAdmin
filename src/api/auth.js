import { request } from "./client";

export function loginAdmin(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
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


