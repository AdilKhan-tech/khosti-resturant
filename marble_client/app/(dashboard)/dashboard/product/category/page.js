"use client";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { toast, ToastContainer } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import axios from "axios";
import AddCategory from "@/components/dashboard/product/AddCategory";
import { useEffect, useState } from "react";
import {getCategoriesRoute,deleteCategoryByIdRoute,} from "@/utils/apiRoutes";
import Offcanvas from "react-bootstrap/Offcanvas";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import Common from "@/utils/Common"

export default function Category() {
  const { token } = useAxiosConfig();
  const [rawCategories, setRawCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [pageLimit, setPageLimit] = useState(25);
  const [keywords, setKeywords] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchCategories = async () => {
    if (!token) return;

    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords,
        sortOrder,
        sortField,
      };

      const response = await axios.get(getCategoriesRoute, { params });
      const rawData = response.data.data;

      // 🔥 VERY IMPORTANT
      setRawCategories(rawData);

      const tree = Common.buildCategoryTree(rawData);
      const flatList = Common.flattenCategories(tree);

      setCategories(flatList);
      setTotalEntries(response.data.pagination.total);
      setPageCount(response.data.pagination.pageCount);

    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  useEffect(() => {
    if (keywords != "") {
      if (keywords.trim() == "") return;
      const delay = setTimeout(() => {
        fetchCategories();
      }, 500);
      return () => clearTimeout(delay);
    } else {
      fetchCategories();
    }
  }, [currentPage, pageLimit, keywords, sortOrder, sortField, token]);

  useEffect(() => {
    const tree = Common.buildCategoryTree(rawCategories);
    const flatList = Common.flattenCategories(tree);
    setCategories(flatList);
  }, [rawCategories]);

  const showOffcanvasOnAddCategory = () => {
    setCategoryData(null);
    setShowOffcanvas(true);
  };

  const showOffcanvasOnEditCategory = (category) => {
    setCategoryData(category);
    setShowOffcanvas(true);
  };

  const closePopup = () => {
    setShowOffcanvas(false);
  };

  const handleLimitChange = (newLimit) => {
    setPageLimit(newLimit);
    setCurrentPage(1);
  };

  const handleDelete = async (categoryId) => {
    try {
      const response = await axios.delete(
        deleteCategoryByIdRoute(categoryId)
      );

      if (response.status === 200) {
        toast.success("Category deleted successfully", {
          autoClose: 1000,
        });

        setRawCategories(prev =>
          prev.filter(cat => cat.id !== categoryId)
        );
      }
    } catch (error) {
      console.error("Error deleting category", error);
    }
  };

  const showDeleteConfirmation = async (categoryId) => {
    if (await confirmDialog({ message: "Are you sure you want to delete this Category?" })) {
      handleDelete(categoryId);
    }
  };

  const addCategory = (newCategory) => {
    setShowOffcanvas(false);

    // 🔹 Always increase total count
    setTotalEntries(prev => prev + 1);

    // 🔹 Only update UI if user is on page 1
    // and sorting is latest first
    if (currentPage === 1 && sortField === "id" && sortOrder === "DESC") {

      setRawCategories(prev => {
        const updated = [newCategory, ...prev];

        // Maintain page size
        if (updated.length > pageLimit) {
          updated.pop();
        }

        return updated;
      });
    }
  };

  const updateCategory = (updatedCategory) => {
    setRawCategories(prev =>
      prev.map(cat =>
        cat.id === updatedCategory.id ? { ...cat, ...updatedCategory } : cat
      )
    );

    setShowOffcanvas(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSortChange = (field) =>
    Common.handleSortingChange(field, setSortField, setSortOrder);

  return (
    <>
      <section className="mt-3">
        <div className="">
        <div className="d-flex justify-content-between mb-3">
          <p className="pagetitle mb-0 fnt-color">Categories</p>
          <div>
            <div
              className="btn-orange text-white fs-16 text-center"
              onClick={showOffcanvasOnAddCategory}
              role="button"
            >
              <i className="bi bi-plus-circle ms-2"></i>
              <span className="ms-1">Create</span>
          </div>
        </div>
        </div>
            <div className="d-flex">
              <i className="bi bi-search fs-5 px-3 py-1 text-secondary position-absolute"></i>
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
                <thead className="">
                  <tr className="">
                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("id")}>
                      ID
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
                      onClick={() => handleSortChange("slug")}>
                      Slug
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "slug" &&
                        (sortOrder === "asc" ? "↑" : "↓")) ||
                        "↑↓"}
                    </span>
                    </th>
                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("parent_id")}>
                      Parent Category
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "parent_id" &&
                        (sortOrder === "asc" ? "↑" : "↓")) ||
                        "↑↓"}
                    </span>
                    </th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <tr key={category?.id}>
                      <td className="fw-normal fs-14 fnt-color">
                        {category?.id}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        <img
                          src={marbleUploadUrl(category.image_url)}
                          className="image-fluid rounded-5"
                        />
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {"— ".repeat(category.level || 0)}
                        {category?.name_en}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {category?.slug}
                      </td>
                      <td>
                        {category?.parent ? category.parent.name_en : "—"}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <div
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() =>showOffcanvasOnEditCategory(category)}>
                            <i className="bi bi-pencil-square text-primary"></i>
                          </div>
                          <div
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() =>showDeleteConfirmation(category?.id) }>
                            <i className="bi bi-trash text-danger"></i>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Offcanvas
            show={showOffcanvas}
            onHide={() => setShowOffcanvas(false)}
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>
                <div className="fs-24 fnt-color">
                  {categoryData
                    ? "Update Category"
                    : "Add Category"}
                </div>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <hr className="mt-0" />
            <Offcanvas.Body>
              <AddCategory
                categoryData={categoryData}
                onAddCategory={addCategory}
                onUpdateCategory={updateCategory}
                closePopup={closePopup}
              />
            </Offcanvas.Body>
          </Offcanvas>
          <ToastContainer />
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
