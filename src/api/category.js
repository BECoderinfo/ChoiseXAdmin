import { request } from "./client";

export function fetchCategories() {
  return request("/categories");
}

export function createCategory(payload) {
  return request("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCategory(id, payload) {
  return request(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function removeCategory(id) {
  return request(`/categories/${id}`, { method: "DELETE" });
}