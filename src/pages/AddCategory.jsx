import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { PlusCircle, Pencil, Trash2, ImagePlus } from "lucide-react";
import "./styles/AddCategory.css";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  removeCategory,
} from "../api/category";
import {
  fetchSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../api/subcategory";
import { buildAssetUrl } from "../api/client";
import { useRef } from "react";

export default function AddCategory() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subcategories, setSubcategories] = useState([]);
  const [subName, setSubName] = useState("");
  const [subSku, setSubSku] = useState("");
  const [subImageFile, setSubImageFile] = useState(null);
  const [subImagePreview, setSubImagePreview] = useState("");
  const [editSubId, setEditSubId] = useState(null);
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);
  const [isLoadingSub, setIsLoadingSub] = useState(true);
  const [mainImageError, setMainImageError] = useState("");
const categoryFormRef = useRef(null);
const subcategoryFormRef = useRef(null);

  useEffect(() => {
    loadCategories();
    loadSubcategories();
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

  const loadSubcategories = async () => {
    try {
      setIsLoadingSub(true);
      const response = await fetchSubcategories();
      setSubcategories(response?.data || []);
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setIsLoadingSub(false);
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

  const resetSubcategoryForm = () => {
    setSubName("");
    setSubSku("");
    setSubImageFile(null);
    setSubImagePreview("");
    setEditSubId(null);
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    if (!subName.trim()) {
      enqueueSnackbar("Subcategory name is required.", { variant: "warning" });
      return;
    }

    try {
      setIsSubmittingSub(true);
      const formData = new FormData();
      formData.append("name", subName.trim());
      if (subSku.trim()) formData.append("sku", subSku.trim());
      if (subImageFile) formData.append("image", subImageFile);

      if (editSubId) {
        await updateSubcategory(editSubId, formData);
        enqueueSnackbar("Subcategory updated successfully!", { variant: "info" });
      } else {
        await createSubcategory(formData);
        enqueueSnackbar("Subcategory added successfully!", { variant: "success" });
      }

      resetSubcategoryForm();
      loadSubcategories();
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setIsSubmittingSub(false);
    }
  };

  const handleSubcategoryEdit = (subcat) => {
    setEditSubId(subcat._id);
    setSubName(subcat.name);
    setSubSku(subcat.sku || "");
    setSubImagePreview(subcat.image ? buildAssetUrl(subcat.image) : "");
    setSubImageFile(null);
  
    setTimeout(() => {
      subcategoryFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };
  

  const handleSubcategoryDelete = async (id) => {
    try {
      await deleteSubcategory(id);
      enqueueSnackbar("Subcategory deleted!", { variant: "error" });
      loadSubcategories();
      if (editSubId === id) {
        resetSubcategoryForm();
      }
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const handleSubImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 1 * 1024 * 1024; // 1 MB in bytes
      if (file.size > maxSize) {
        setMainImageError("Max 1 MB size");
        setSubImageFile(null);
        setSubImagePreview("");
        e.target.value = ""; // Clear the input
        enqueueSnackbar("Image size exceeds 1 MB. Please select a smaller image.", { variant: "error" });
        return;
      }
      setMainImageError("");
      setSubImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setSubImagePreview(previewUrl);
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setName(cat.name);
  
    setTimeout(() => {
      categoryFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
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
      <form ref={categoryFormRef} onSubmit={handleSubmit}>
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

      {/* SUBCATEGORY FORM */}
      <div className="add-category-form-card">
        <div className="subcat-header">
          <div className="subcat-title-wrap">
            <ImagePlus size={32} />
            <div>
              <h2 className="add-category-title">Subcategories</h2>
              <p className="add-category-subtitle">Add image + name mapped to a category.</p>
            </div>
          </div>
          {editSubId && (
            <button className="subcat-reset-btn" type="button" onClick={resetSubcategoryForm}>
              Clear edit
            </button>
          )}
        </div>

        <form ref={subcategoryFormRef} onSubmit={handleSubcategorySubmit}>
          <div className="add-category-form-group">
            <label className="add-category-form-label">Subcategory Name *</label>
            <input
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              className="add-category-form-input"
              placeholder="Enter subcategory name"
              required
            />
          </div>

          

          <div className="add-category-form-group">
            <label className="add-category-form-label">Image *</label>
            <input
              type="file"
              accept="image/*"
              id="subImageInput"
              className="file-input"
              onChange={handleSubImageSelect}
              required={!editSubId && !subImagePreview}
            />
            <label htmlFor="subImageInput" className="custom-upload-btn">
              Select Image
            </label>

            {subImagePreview && (
              <div className="subcat-image-preview">
                <img src={subImagePreview} alt="Subcategory preview" />
              </div>
            )}
            {mainImageError && (
              <div className="image-error-message">{mainImageError}</div>
            )}
          </div>

          <button type="submit" className="add-category-btn" disabled={isSubmittingSub}>
            {editSubId ? (
              <>
                <Pencil size={18} style={{ marginRight: "8px" }} /> Update Subcategory
              </>
            ) : (
              <>
                <PlusCircle size={18} style={{ marginRight: "8px" }} /> Add Subcategory
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

      {/* SUBCATEGORY LIST */}
      {isLoadingSub ? (
        <p className="add-category-loading">Loading subcategories...</p>
      ) : subcategories.length > 0 ? (
        <div className="added-category-list">
          <h2 className="added-category-title">Added Subcategories</h2>
          <div className="added-category-items subcat-grid">
            {subcategories.map((subcat) => (
              <div key={subcat._id} className="subcat-card">
                <div className="subcat-thumb">
                  {subcat.image ? (
                    <img src={buildAssetUrl(subcat.image)} alt={subcat.name} />
                  ) : (
                    <span className="subcat-placeholder">No image</span>
                  )}
                </div>
                <div className="subcat-info">
                  <p className="added-category-name mb-0">{subcat.name}</p>
                </div>
                <div className="action-buttons">
                  <button className="edit-btn" onClick={() => handleSubcategoryEdit(subcat)}>
                    <Pencil size={16} />
                  </button>
                  <button className="delete-btn" onClick={() => handleSubcategoryDelete(subcat._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="add-category-loading">No subcategories yet. Add one above.</p>
      )}
    </div>
  );
}
