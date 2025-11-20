import { useState, useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import { PackagePlus, Trash2 } from "lucide-react";
import "./styles/AddProduct.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchCategories } from "../api/category";
import { createProduct, fetchProduct, updateProduct, fetchProducts } from "../api/product";
import { buildAssetUrl } from "../api/client";

const generateRandomSKU = () => {
  const randomNum = Math.floor(Math.random() * 99) + 1; // Generates 1-99
  const paddedNum = String(randomNum).padStart(2, "0"); // Pads to 2 digits (01, 02, etc.)
  return `Choisex${paddedNum}`;
};

const generateUniqueSKU = async () => {
  try {
    const response = await fetchProducts();
    const existingProducts = response?.data || [];
    const existingSKUs = new Set(existingProducts.map((p) => p.sku?.toLowerCase()));

    let newSKU;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop

    do {
      newSKU = generateRandomSKU();
      attempts++;
      if (attempts >= maxAttempts) {
        // If we've tried too many times, append timestamp to make it unique
        const timestamp = Date.now().toString().slice(-4);
        newSKU = `Choisex${timestamp}`;
        break;
      }
    } while (existingSKUs.has(newSKU.toLowerCase()));

    return newSKU;
  } catch (error) {
    // If API call fails, just return a random SKU
    console.error("Error fetching products for SKU check:", error);
    return generateRandomSKU();
  }
};

const createEmptyProduct = (sku = "") => ({
  SKU: sku,
  name: "",
  price: "",
  markprice: "",
  category: "",
  Availability: "",
  Waterproof: "Yes",
  Rechargeable: "Yes",
  Material: "",
  Feature: "",
  description: "",
  customerrating: [{ star: 5, Review: "", username: "", userimage: "" }],
});

export default function AddProduct() {
  const MAX_GALLERY_IMAGES = 4;
  const [product, setProduct] = useState(createEmptyProduct());
  const [categories, setCategories] = useState([]);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingMainImage, setExistingMainImage] = useState("");
  const [existingGallery, setExistingGallery] = useState([]);
  const [isGeneratingSKU, setIsGeneratingSKU] = useState(false);
  const [searchParams] = useSearchParams();
  const editProductId = searchParams.get("id");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchCategories();
        setCategories(response?.data || []);
      } catch (error) {
        enqueueSnackbar(error.message, { variant: "error" });
      }
    })();
  }, []);

  useEffect(() => {
    if (!mainImageFile) {
      setMainImagePreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(mainImageFile);
    setMainImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [mainImageFile]);

  useEffect(() => {
    const previews = galleryFiles.map((file) => URL.createObjectURL(file));
    setGalleryPreviews(previews);
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [galleryFiles]);

  useEffect(() => {
    if (!editProductId) {
      (async () => {
        setIsGeneratingSKU(true);
        try {
          const uniqueSKU = await generateUniqueSKU();
          const newProduct = createEmptyProduct(uniqueSKU);
          setProduct(newProduct);
          setExistingMainImage("");
          setExistingGallery([]);
          setMainImageFile(null);
          setGalleryFiles([]);
        } catch (error) {
          enqueueSnackbar("Error generating SKU. Please try again.", { variant: "error" });
        } finally {
          setIsGeneratingSKU(false);
        }
      })();
      return;
    }

    (async () => {
      try {
        setIsSubmitting(true);
        const response = await fetchProduct(editProductId);
        const data = response?.data;
        if (!data) throw new Error("Product not found");

        setProduct({
          SKU: data.sku || "",
          name: data.name || "",
          price: data.price || "",
          markprice: data.markprice || "",
          category: data.category?._id || data.category || "",
          Availability: data.availability || "",
          Waterproof: data.waterproof || "Yes",
          Rechargeable: data.rechargeable || "Yes",
          Material: data.material || "",
          Feature: data.feature || "",
          description: data.description || "",
          customerrating:
            data.customerrating?.length > 0
              ? data.customerrating.map((review) => ({
                star: review.star || 5,
                Review: review.review || "",
                username: review.username || "",
                userimage: review.userimage || "",
              }))
              : [{ star: 5, Review: "", username: "", userimage: "" }],
        });

        setExistingMainImage(data.mainImage || "");
        setExistingGallery(data.galleryImages || []);
        setMainImageFile(null);
        setGalleryFiles([]);
      } catch (error) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        setIsSubmitting(false);
      }
    })();
  }, [editProductId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleMainImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
    }
  };

  const handleGallerySelect = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    if (!files.length) return;

    setGalleryFiles((prev) => {
      const currentTotal = existingGallery.length + prev.length;

      if (currentTotal >= MAX_GALLERY_IMAGES) {
        enqueueSnackbar("Gallery already has 4 images. Remove one to add another.", {
          variant: "warning",
        });
        return prev;
      }

      const remainingSlots = MAX_GALLERY_IMAGES - currentTotal;
      const acceptedFiles = files.slice(0, remainingSlots);

      if (files.length > remainingSlots) {
        enqueueSnackbar("Only 4 gallery images are allowed. Extra files were ignored.", {
          variant: "warning",
        });
      }

      return [...prev, ...acceptedFiles];
    });
  };

  const handleRemoveExistingGallery = (index) => {
    setExistingGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewGallery = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReviewChange = (index, field, value) => {
    const updated = [...product.customerrating];
    updated[index][field] = value;
    setProduct({ ...product, customerrating: updated });
  };

  const addNewReview = () => {
    setProduct({
      ...product,
      customerrating: [
        ...product.customerrating,
        { star: 5, Review: "", username: "", userimage: "" },
      ],
    });
  };

  const deleteReview = (index) => {
    const updated = product.customerrating.filter((_, i) => i !== index);
    setProduct({ ...product, customerrating: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mainImageFile && !existingMainImage) {
      enqueueSnackbar("Please select a main product image.", { variant: "warning" });
      return;
    }

    if (!product.category) {
      enqueueSnackbar("Please pick a category.", { variant: "warning" });
      return;
    }

    if (existingGallery.length + galleryFiles.length > MAX_GALLERY_IMAGES) {
      enqueueSnackbar("You can only keep up to 4 gallery images.", { variant: "warning" });
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      Object.entries(product).forEach(([key, value]) => {
        if (key === "customerrating") return;
        formData.append(key, value);
      });

      formData.append("customerrating", JSON.stringify(product.customerrating));
      if (mainImageFile) {
        formData.append("mainImage", mainImageFile);
      }

      galleryFiles.forEach((file) => formData.append("gallery", file));
      formData.append("existingMainImage", existingMainImage);
      formData.append("existingGallery", JSON.stringify(existingGallery));

      if (editProductId) {
        await updateProduct(editProductId, formData);
        enqueueSnackbar("Product updated successfully!", { variant: "success" });
      } else {
        await createProduct(formData);
        enqueueSnackbar("Product added successfully!", { variant: "success" });
        // Generate new unique SKU for next product
        const uniqueSKU = await generateUniqueSKU();
        setProduct(createEmptyProduct(uniqueSKU));
        setExistingMainImage("");
        setExistingGallery([]);
      }

      setMainImageFile(null);
      setGalleryFiles([]);
      navigate("/view-products");
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <div className="add-product-icon">
          <PackagePlus size={40} strokeWidth={1.8} />
        </div>
        <h1 className="add-product-title">{editProductId ? "Edit Product" : "Add New Product"}</h1>
        <p className="add-product-subtitle">
          {editProductId ? "Update the product details below." : "Create a product with category mapping and media uploads."}
        </p>
      </div>

      <div className="add-product-form-card">
        <form onSubmit={handleSubmit}>
          <div className="add-product-form-row">
            <div className="add-product-form-group">
              <label className="add-product-form-label">Product Name *</label>
              <input name="name" value={product.name} onChange={handleChange} className="add-product-form-input" required />
            </div>
            <div className="add-product-form-group">
              <label className="add-product-form-label">SKU *</label>
              <input
                name="SKU"
                value={isGeneratingSKU ? "Generating..." : product.SKU}
                onChange={handleChange}
                className="add-product-form-input"
                required
                readOnly
                disabled={isGeneratingSKU}
                style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
              />
            </div>
          </div>

          <div className="add-product-form-row">
            <div className="add-product-form-group">
              <label className="add-product-form-label">Category *</label>
              <select name="category" value={product.category} onChange={handleChange} className="add-product-form-input" required>
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="add-product-form-group">
              <label className="add-product-form-label">Price (₹) *</label>
              <input type="number" name="price" value={product.price} onChange={handleChange} className="add-product-form-input" required />
            </div>
          </div>

          <div className="add-product-form-row">
            <div className="add-product-form-group">
              <label className="add-product-form-label">Marked Price (₹) *</label>
              <input type="number" name="markprice" value={product.markprice} onChange={handleChange} className="add-product-form-input" required />
            </div>
            <div className="add-product-form-group">
              <label className="add-product-form-label">Stock *</label>
              <input type="number" name="Availability" value={product.Availability} onChange={handleChange} className="add-product-form-input" required />
            </div>
          </div>

          <div className="add-product-form-row">
            <div className="add-product-form-group">
              <label className="add-product-form-label">Material *</label>
              <input name="Material" value={product.Material} onChange={handleChange} className="add-product-form-input" required />
            </div>
            <div className="add-product-form-group">
              <label className="add-product-form-label">Feature</label>
              <input name="Feature" value={product.Feature} onChange={handleChange} className="add-product-form-input" />
            </div>
          </div>

          <div className="add-product-form-group">
            <label className="add-product-form-label">Main Image *</label>

            {/* Hidden input */}
            <input
              type="file"
              accept="image/*"
              id="mainImageInput"
              onChange={handleMainImageSelect}
              className="file-input"
              required={!editProductId}
            />

            {/* Custom Button */}
            <label htmlFor="mainImageInput" className="custom-upload-btn">
              Select Main Image
            </label>

            {(mainImagePreview || existingMainImage) && (
              <div className="image-preview">
                <img
                  src={mainImagePreview || buildAssetUrl(existingMainImage)}
                  alt="Main preview"
                />
              </div>
            )}
          </div>


          <div className="add-product-form-group">
            <label className="add-product-form-label">Gallery Images (Max 4)</label>

            {/* Hidden input */}
            <input
              type="file"
              id="galleryInput"
              accept="image/*"
              multiple
              onChange={handleGallerySelect}
              className="file-input"
            />

            {/* Custom Button */}
            <label htmlFor="galleryInput" className="custom-upload-btn">
              Select Gallery Images
            </label>

            {existingGallery.length > 0 && (
              <div className="existing-gallery-grid">
                {existingGallery.map((img, index) => (
                  <div key={img + index} className="image-preview">
                    <button
                      type="button"
                      className="image-delete-btn"
                      onClick={() => handleRemoveExistingGallery(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <img src={buildAssetUrl(img)} alt={`Existing ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}

            {galleryPreviews.length > 0 && (
              <div className="add-product-images-grid">
                {galleryPreviews.map((src, index) => (
                  <div key={index} className="image-preview">
                    <button
                      type="button"
                      className="image-delete-btn"
                      onClick={() => handleRemoveNewGallery(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <img src={src} alt={`Gallery ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>


          <div className="add-product-form-row">
            <div className="add-product-form-group">
              <label className="add-product-form-label">Waterproof</label>
              <select name="Waterproof" value={product.Waterproof} onChange={handleChange} className="add-product-form-input">
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div className="add-product-form-group">
              <label className="add-product-form-label">Rechargeable</label>
              <select name="Rechargeable" value={product.Rechargeable} onChange={handleChange} className="add-product-form-input">
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
          </div>

          <div className="add-product-form-group">
            <label className="add-product-form-label">Description *</label>
            <textarea name="description" value={product.description} onChange={handleChange} className="add-product-form-textarea" required rows="4" />
          </div>

          <div className="add-product-rating-section">
            <div className="flex-header">
              <h3 className="add-product-rating-title">Customer Reviews</h3>
              <button type="button" className="add-review-btn" onClick={addNewReview}>
                + Add Review
              </button>
            </div>

            {product.customerrating.map((review, index) => (
              <div key={index} className="review-card">
                <div className="add-product-form-row">
                  <div className="add-product-form-group">
                    <label className="add-product-form-label">Stars</label>
                    <select value={review.star} onChange={(e) => handleReviewChange(index, "star", parseInt(e.target.value, 10))} className="add-product-form-input">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="add-product-form-group">
                    <label className="add-product-form-label">Username</label>
                    <input value={review.username} onChange={(e) => handleReviewChange(index, "username", e.target.value)} className="add-product-form-input" />
                  </div>
                </div>

                <div className="add-product-form-group">
                  <label className="add-product-form-label">Review</label>
                  <textarea value={review.Review} onChange={(e) => handleReviewChange(index, "Review", e.target.value)} className="add-product-form-textarea" rows="3" />
                </div>

                <div className="add-product-form-group">
                  <label className="add-product-form-label">User Image</label>
                  <input value={review.userimage} onChange={(e) => handleReviewChange(index, "userimage", e.target.value)} className="add-product-form-input" />
                </div>

                <button type="button" className="delete-review-btn" onClick={() => deleteReview(index)}>
                  Delete Review
                </button>
              </div>
            ))}
          </div>

          <button type="submit" className="add-product-btn" disabled={isSubmitting}>
            <PackagePlus size={18} style={{ marginRight: "8px" }} />
            {isSubmitting ? "Saving..." : editProductId ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
