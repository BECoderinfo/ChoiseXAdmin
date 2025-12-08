import { request } from "./client";

export function fetchSubcategories() {
  return request(`/subcategories`);
}

export function createSubcategory(formData) {
  return request("/subcategories", {
    method: "POST",
    body: formData,
  });
}

export function updateSubcategory(id, formData) {
  return request(`/subcategories/${id}`, {
    method: "PUT",
    body: formData,
  });
}

export function deleteSubcategory(id) {
  return request(`/subcategories/${id}`, { method: "DELETE" });
}


