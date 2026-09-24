"use client";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { getProductByIdRoute } from "@/utils/apiRoutes";

function displayValue(value) {
  return value === null || value === undefined || value === "" ? "N/A" : value;
}

function InfoCard({ label, value, children, className = "col-xl-3 col-md-6" }) {
  return (
    <div className={className}>
      <div className="order-info-box bg-light border-0 shadow-none p-3 rounded-3 h-100">
        {children || (
          <p className="text-dark fs-16 fw-medium mb-0 text-break">{displayValue(value)}</p>
        )}
        <h6 className="fs-14 fw-normal mt-2 mb-0 text-muted">{label}</h6>
      </div>
    </div>
  );
}

function BadgeList({ items, icon, emptyText }) {
  if (!items?.length) {
    return <span className="text-muted fs-14">{emptyText}</span>;
  }

  return (
    <div className="d-flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span key={item.id || index} className="badge bg-secondary-subtle text-dark fs-14 fw-medium">
          {icon && <i className={`bi ${icon} me-1`}></i>}
          {item.name_en || item.name || "N/A"}
        </span>
      ))}
    </div>
  );
}

export default function ProductViewPage() {
  const { productId } = useParams();
  const router = useRouter();
  const { token } = useAxiosConfig();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProduct = useCallback(async () => {
    if (!token || !productId) return;

    try {
      const response = await axios.get(getProductByIdRoute(productId));
      setProduct(response.data?.data || response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  }, [productId, token]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-fluid py-4 product-view-page">
        <div className="alert alert-danger" role="alert">
          Failed to load product details. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 product-view-page">
      <div className="d-flex justify-content-between mb-3">
        <p className="pagetitle mb-0 fnt-color">Product Details</p>
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="form-cancel-btn d-inline-flex align-items-center gap-2 bg-white border rounded-3 text-muted fs-14 px-3 py-2"
          >
            <i className="bi bi-arrow-left" aria-hidden="true"></i>
            Back
          </button>
        </div>
      </div>

      <div className="card bg-transparent border-0 shadow-none mt-3">
        <div className="card-body px-0 pt-0">
          <div className="bg-white border-0 shadow-none rounded-4 p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <h5 className="mb-1 fs-18 fw-semibold fnt-color">
                  {product.name_en || `Product #${productId}`}
                </h5>
              </div>
              <span className="badge bg-light text-dark border fs-14 px-3 py-2">
                ID: #{productId}
              </span>
            </div>

            <hr className="my-4" />

            <div className="row g-4 align-items-start">
              <div className="col-lg-4 col-md-5">
                <div className="order-info-box bg-light border-0 shadow-none p-3 rounded-3 h-100">
                  <div className="position-relative dashboard-product-image-frame">
                    <img
                      src={marbleUploadUrl(product.image_url)}
                      alt={product.name_en || "Product image"}
                      className="img-fluid rounded-3 w-100 h-100 object-fit-cover bg-white"
                    />
                  </div>
                  <div className="mt-3">
                    <span className="badge bg-primary fs-16 px-3 py-2 w-100">
                      ${displayValue(product.regular_price)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-lg-8 col-md-7">
                <div className="row g-3">
                  <InfoCard label="English Name" value={product.name_en} className="col-md-6" />
                  <InfoCard label="Arabic Name" value={product.name_ar} className="col-md-6" />
                  <InfoCard label="Gender" value={product?.gender?.name_en} className="col-md-6" />
                  <InfoCard label="Product Tags" className="col-md-6">
                    <BadgeList items={product.tags} emptyText="No tags" />
                  </InfoCard>
                  <InfoCard label="Product Description" className="col-12">
                    <div
                      className="text-dark fs-16 fw-medium mb-0 text-break"
                      dangerouslySetInnerHTML={{ __html: product.description || "N/A" }}
                    />
                  </InfoCard>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-0 shadow-none rounded-4 p-4 mb-4">
            <h5 className="mb-3 fs-18 fw-semibold fnt-color">Product Information</h5>

            <div className="row g-3">
              <InfoCard label="Tax Status" value={product.tax_status} />
              <InfoCard label="Tax Class" value={product.tax_class} />
              <InfoCard label="Product SKU" value={product.sku} />
              <InfoCard
                label="Stock Status"
                value={
                  product.stock ||
                  (product.stock_status === "outofstock"
                    ? "Out of Stock"
                    : "In Stock")
                }
              />
            </div>
          </div>

          <div className="bg-white border-0 shadow-none rounded-4 p-4">
            <h5 className="mb-3 fs-18 fw-semibold fnt-color">Categories & Organization</h5>

            <div className="row g-3">
              <InfoCard label="Product Categories" className="col-xl-4 col-md-4">
                <BadgeList items={product.categories} icon="bi-folder" emptyText="No categories" />
              </InfoCard>
              <InfoCard label="Product Branches" className="col-xl-4 col-md-4">
                <BadgeList items={product.branches} icon="bi-shop" emptyText="No branches" />
              </InfoCard>
              <InfoCard label="Product Occasions" className="col-xl-4 col-md-4">
                <BadgeList items={product.occasions} icon="bi-calendar-event" emptyText="No occasions" />
              </InfoCard>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}