import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import "./styles/AddCategory.css";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  removeCategory,
} from "../api/category";

export default function AddCategory() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetchCategories();
      setCategories(response?.data || []);
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      setIsSubmitting(true);

      if (editId) {
        await updateCategory(editId, { name: name.trim() });
        enqueueSnackbar("Category updated successfully!", { variant: "info" });
      } else {
        await createCategory({ name: name.trim() });
        enqueueSnackbar(`Category "${name}" added successfully!`, {
          variant: "success",
        });
      }

      setName("");
      setEditId(null);
      loadCategories();
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setName(cat.name);
  };

  const handleDelete = async (id) => {
    try {
      await removeCategory(id);
      enqueueSnackbar("Category deleted!", { variant: "error" });
      loadCategories();
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  return (
    <div className="add-category-container">
      {/* HEADER */}
      <div className="add-category-header">
        <div className="add-category-icon">
          <PlusCircle size={40} strokeWidth={1.8} />
        </div>
        <h1 className="add-category-title">Add New Category</h1>
        <p className="add-category-subtitle">
          Create, edit and manage your product categories effortlessly.
        </p>
      </div>

      {/* FORM */}
      <div className="add-category-form-card">
        <form onSubmit={handleSubmit}>
          <div className="add-category-form-group">
            <label className="add-category-form-label">Category Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="add-category-form-input"
              placeholder="Enter category name"
              required
            />
          </div>

          <button type="submit" className="add-category-btn" disabled={isSubmitting}>
            {editId ? (
              <>
                <Pencil size={18} style={{ marginRight: "8px" }} /> Update
              </>
            ) : (
              <>
                <PlusCircle size={18} style={{ marginRight: "8px" }} /> Add
                Category
              </>
            )}
          </button>
        </form>
      </div>

      {/* CATEGORY LIST */}
      {isLoading ? (
        <p className="add-category-loading">Loading categories...</p>
      ) : categories.length > 0 ? (
        <div className="added-category-list">
          <h2 className="added-category-title">Added Categories</h2>

          <div className="added-category-items">
            {categories.map((cat) => (
              <div key={cat._id} className="added-category-card">
                <span className="added-category-dot" />
                <p className="added-category-name mb-0">{cat.name}</p>

                <div className="action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(cat)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(cat._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="add-category-loading">No categories yet. Start by adding one.</p>
      )}
    </div>
  );
}
