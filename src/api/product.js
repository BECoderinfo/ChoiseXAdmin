import { request } from "./client";

export function createProduct(formData) {
  return request("/products", {
    method: "POST",
    body: formData,
  });
}

export function updateProduct(id, formData) {
  return request(`/products/${id}`, {
    method: "PUT",
    body: formData,
  });
}

export function fetchProducts() {
  return request("/products");
}

export function fetchProduct(id) {
  return request(`/products/${id}`);
}

export function deleteProduct(id) {
  return request(`/products/${id}`, { method: "DELETE" });
}

