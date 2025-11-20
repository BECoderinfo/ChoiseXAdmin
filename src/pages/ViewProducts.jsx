import { useState, useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import { Package, Trash2, Wrench, EyeOff, Edit } from "lucide-react";
import "./styles/ViewProducts.css";
import { FaRegStar, FaStar } from "react-icons/fa";
import { fetchProducts, deleteProduct } from "../api/product";
import { buildAssetUrl } from "../api/client";
import { useNavigate } from "react-router-dom";

export default function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetchProducts();
      setProducts(response?.data || []);
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId);
      enqueueSnackbar("Product deleted successfully!", { variant: "success" });
      loadProducts();
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const handleEdit = (productId) => {
    navigate(`/add-product?id=${productId}`);
  };

  return (
    <div className="vp-container">
      <div className="add-product-header">
        <div className="add-product-icon">
          <Package size={40} strokeWidth={1.8} />
        </div>
        <h1 className="add-product-title">View Products</h1>
        <p className="add-product-subtitle">Manage your product inventory.</p>
      </div>

      {isLoading ? (
        <div className="vp-empty">
          <p className="vp-empty-main">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="vp-empty">
          <EyeOff size={48} />
          <p className="vp-empty-main">No products found</p>
          <p className="vp-empty-sub">Add products to see them here.</p>
        </div>
      ) : (
        <div className="vp-list">
          {products.map((product) => (
            <div key={product._id} className="vp-card-land">
             <div>
             <div className="vp-left-img mb-5">
                {product.mainImage ? (
                  <img src={buildAssetUrl(product.mainImage)} alt={product.name} />
                ) : (
                  <Package size={60} className="vp-no-img" />
                )}
              </div>

              <div className="vp-extras-row">
                  {product.galleryImages?.map(
                    (img, i) =>
                      img && (
                        <img key={i} src={buildAssetUrl(img)} className="vp-extra-img" alt="" />
                      )
                  )}
                </div>
             </div>

              <div className="vp-right">
                <div className="vp-top-row">
                  <h3 className="vp-name">{product.name}</h3>
                  <p className="vp-sku">SKU: {product.sku}</p>
                </div>

                <div className="vp-price-row">
                  <span className="vp-price">₹{product.price}</span>
                  <span className="vp-mrp">₹{product.markprice}</span>
                </div>

                <div className="vp-tags">
                  <span className="vp-tag">Category: {product.category?.name || "—"}</span>
                  <span className="vp-tag">Stock: {product.availability}</span>
                  <span className="vp-tag">
                    Material: {product.material}
                  </span>
                  <span className="vp-tag">Waterproof: {product.waterproof}</span>
                  <span className="vp-tag">Rechargeable: {product.rechargeable}</span>
                  <span className="vp-tag">Feature: {product.feature}</span>
                  <span className="vp-tag">Description: {product.description}</span>
                </div>

                {product.customerrating?.length > 0 && (
                  <div className="vp-rating-row">
                    {product.customerrating.map((r, i) => (
                      <div key={i} className="vp-rating-box-land">
                        <div className="vp-rating-img-land">
                          {r.userimage ? (
                            <img src={r.userimage} alt="user" />
                          ) : (
                            <div className="vp-rating-placeholder">U</div>
                          )}
                        </div>

                        <div>
                          <div className="vp-stars">
                            {[...Array(5)].map((_, starIndex) =>
                              starIndex < r.star ? (
                                <FaStar key={starIndex} className="vp-star filled" />
                              ) : (
                                <FaRegStar key={starIndex} className="vp-star empty" />
                              )
                            )}
                          </div>

                          <p className="vp-review mb-0">{r.review}</p>
                          <p className="vp-user">{r.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="vp-action-row-land">
                  <button className="vp-edit" onClick={() => handleEdit(product._id)}>
                    <Edit size={14} /> Edit
                  </button>
                  <button className="vp-delete" onClick={() => handleDelete(product._id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
