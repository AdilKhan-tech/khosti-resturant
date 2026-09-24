"use client";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import React from "react";
import { useState, useEffect } from "react";
import {getProductsRoute, deleteProductByIdRoute} from "@/utils/apiRoutes"
import { ToastContainer, toast } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import Common from "@/utils/Common";
import useAxiosConfig from '@/hooks/useAxiosConfig';
import axios from "axios";
import { useRouter } from "next/navigation";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";

export default function ProductPageDetail() {
  const [sortField, setSortField] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(25);
  const [sortOrder, setSortOrder] = useState("asc");
  const [products, setProducts] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [keywords, setKeywords] = useState("");
  const {token} = useAxiosConfig();
  const router = useRouter();

  const fetchAllProducts = async () => {
    if (!token) return;
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords: keywords,
        sortOrder,
        sortField,
      };
      const response = await axios.get(getProductsRoute, { params });
      setProducts(response?.data?.data);
      setPageCount(response.data.pagination.pageCount);
      setTotalEntries(response.data.pagination.total);
    } catch (error) {
      console.error("Error fetching Products", error);
    }
  };

  useEffect(() => {
    if (keywords != "") {
      if (keywords.trim() == "") return;
      const delay = setTimeout(() => {
        fetchAllProducts();
      }, 500);
      return () => clearTimeout(delay);
    } else {
      fetchAllProducts();
    }
  }, [currentPage, pageLimit, keywords, sortOrder, sortField, token]);

  const handleSortChange = (field) =>
    Common.handleSortingChange(field, setSortField, setSortOrder);

  const handleDelete = async (productId) => {
    try {
      const response = await axios.delete(deleteProductByIdRoute(productId));
      if (response.status === 200) {
        toast.success("Product deleted successfully!", { autoClose: 1000 });
        setProducts((prev) => prev.filter((product) => product.id !== productId));
      }
    } catch (error) {
      toast.error("Failed to delete Product.");
    }
  };

  const showDeleteConfirmation = async (productId) => {
    const confirmed = await confirmDialog({
      message: "Are you sure you want to delete this Product?",
    });
    if (confirmed) {
      handleDelete(productId);
    }
  };


  const handleLimitChange = (newLimit) => {
    setPageLimit(newLimit);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };


  return (
    <>
      <section className="mt-3">
        <div className="">
        <div className="d-flex justify-content-between mb-3">
          <p className="pagetitle mb-0 fnt-color">Products</p>
          <div>
            <div
              className="btn-orange text-white fs-16 text-center"
              onClick={() => router.push("/dashboard/product/add")}
              role="button"
            >
              <i className="bi bi-plus-circle me-2"></i>Create
            </div>
            </div>
            </div>
            <div className="d-flex">
              <i className="bi bi-search fs-20 px-3 py-1 text-secondary position-absolute"></i>
              <input
                type="text"
                className="form-control px-5 text-dark-custom dashboard-search-input"
                placeholder="Search here..."
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
        </div>
        <div className="px-0 pt-0 rounded-2 p-0 mt-3">
          <div className="table-responsive">
            <div className="data-table">
              <table className="table datatable-wrapper">
                <thead>
                  <tr className="">
                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("id")}>
                      Id
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "id" &&
                        (sortOrder === "asc" ? "↑" : "↓")) ||
                         "↑↓"}
                      </span>
                    </th>

                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("image_url")}>
                      Image
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "image_url" &&
                        (sortOrder === "asc" ? "↑" : "↓")) ||
                         "↑↓"}
                      </span>
                    </th>

                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("name_en")}>
                      Name
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "name_en" &&
                        (sortOrder === "asc" ? "↑" : "↓")) ||
                         "↑↓"}
                      </span>
                    </th>

                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("sku")}>
                      SKU
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "sku" &&
                        (sortOrder === "asc" ? "↑" : "↓")) ||
                         "↑↓"}
                      </span>
                    </th>

                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("stock")}>
                      Stock
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "stock" &&
                        (sortOrder === "asc" ? "↑" : "↓")) ||
                         "↑↓"}
                      </span>
                    </th>

                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("price")}>
                      Price
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "price" &&
                        (sortOrder === "asc" ? "↑" : "↓")) ||
                         "↑↓"}
                      </span>
                    </th>

                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("category")}>
                      Categories
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "category" &&
                        (sortOrder === "asc" ? "↑" : "↓")) ||
                         "↑↓"}
                      </span>
                    </th>

                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("date")}>
                      Date
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "date" &&
                        (sortOrder === "asc" ? "↑" : "↓")) ||
                         "↑↓"}
                      </span>
                    </th>

                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("branches")}>
                      Branches
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "branches" &&
                        (sortOrder === "asc" ? "↑" : "↓")) ||
                         "↑↓"}
                      </span>
                    </th>

                    <th className="fw-medium fs-14 fnt-color text-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                  <tr key={product.id || product.id || index}>
                    <td className="fw-normal fs-14 fnt-color">
                      {product?.id}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      <img
                        src={marbleUploadUrl(product.image_url)}
                        className="image-fluid rounded-1"
                      />
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {product?.name_en}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {product?.sku || "N/A"}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {product?.stock ||
                        (product?.stock_status === "outofstock"
                          ? "Out of Stock"
                          : "In Stock")}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {product?.regular_price}
                    </td>
                    <td
                      role="button"
                      className="fw-normal fs-14 fnt-color"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      data-bs-custom-class="custom-tooltip"
                      data-bs-title={
                        product?.categories?.length
                          ? product.categories.map(cat => cat.name_en).join(", ")
                          : "N/A"}>
                      {product?.categories?.length
                        ? Common.truncateText(product.categories.map(cat => cat.name_en).join(", "), 10)
                        : "N/A"}
                    </td>
                    <td
                      className="fw-normal fs-14 fnt-color">
                      {Common.dateFormat(product?.created_at)}
                    </td>
                    <td
                      role="button"
                      className="fw-normal fs-14 fnt-color"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      data-bs-custom-class="custom-tooltip"
                      data-bs-title={
                      product?.branches?.length
                        ? product.branches.map(b => b.name_en).join(", ")
                        : "N/A"}>
                      {product?.branches?.length
                        ? Common.truncateText(product.branches.map(b => b.name_en).join(", "),10)
                        : "N/A"}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                          onClick={() => router.push(`/dashboard/product/${product.id}/view`)}>
                          <i className="bi bi-eye text-secondary"></i>
                        </button>
                        <button
                          className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                          onClick={() => router.push(`/dashboard/product/${product.id}/add`)}>
                          <i className="bi bi-pencil-square text-primary"></i>
                        </button>
                        <button
                          className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                          onClick={() => showDeleteConfirmation(product?.id)}>
                          <i className="bi bi-trash3 text-danger"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
          <ToastContainer/>
        </div>
      </section>
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mt-0">
        <Pagination
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={handlePageChange}
          pageLimit={pageLimit}
          totalEntries={totalEntries}
        />

        <EntriesPerPageSelector
          pageLimit={pageLimit}
          onPageLimitChange={handleLimitChange}
        />
      </div>
    </>
  );
}
