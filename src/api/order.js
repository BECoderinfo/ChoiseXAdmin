import { request } from "./client";

// Admin: fetch all orders
export function fetchOrders() {
  return request("/admin/orders", {
    method: "GET",
  });
}

export function fetchOrder(orderId) {
  return request(`/admin/orders/${orderId}`, {
    method: "GET",
  });
}


export function getTracking(orderId) {
  return request(`/order/get-tracking/${orderId}`, { method: "GET" });
}

export function refundOrder(orderId) {
  return request(`/admin/orders/${orderId}/refund`, {
    method: "POST",
  });
}

export function updateTracking(orderId, payload) {
  return request(`/order/update-tracking/${orderId}`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
}


