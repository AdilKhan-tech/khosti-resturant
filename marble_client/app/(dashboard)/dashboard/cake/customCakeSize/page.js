"use client";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { toast, ToastContainer } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import axios from "axios";
import AddCustomCakeSize from "@/components/dashboard/cake/AddCustomCakeSize";
import { useEffect, useState } from "react";
import {getCustomCakeSizesRoute,deleteCustomCakeSizeByIdRoute, updateCustomCakeSizeByIdRoute,} from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import Offcanvas from "react-bootstrap/Offcanvas";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import Common from "@/utils/Common"

export default function CustomCakeSize() {
  const { token } = useAxiosConfig();
  const [customCakeSizes, setCustomCakeSizes] = useState([]);
  const [customCakeSizeData, setCustomCakeSizeData] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [pageLimit, setPageLimit] = useState(25);
  const [keywords, setKeywords] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchCustomCakeSizes = async () => {
    if (!token) return;
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords: keywords,
        sortOrder,
        sortField,
      };
      const response = await axios.get(getCustomCakeSizesRoute, { params });

      setCustomCakeSizes(response.data.data);
      setTotalEntries(response.data.pagination.total);
      setPageCount(response.data.pagination.pageCount);
    } catch (error) {
      console.error("Error fetching custom cake sizes", error);
    }
  };
  useEffect(() => {
    if (keywords != "") {
      if (keywords.trim() == "") return;
      const delay = setTimeout(() => {
        fetchCustomCakeSizes();
      }, 500);
      return () => clearTimeout(delay);
    } else {
      fetchCustomCakeSizes();
    }
  }, [currentPage, pageLimit, keywords, sortOrder, sortField, token]);

  const showOffcanvasOnAddCustomCakesSize = () => {
    setCustomCakeSizeData(null);
    setShowOffcanvas(true);
  };

  const showOffcanvasOnEditCustomCakesSize = (customCakeSize) => {
    setCustomCakeSizeData(customCakeSize);
    setShowOffcanvas(true);
  };

  const closePopup = () => {
    setShowOffcanvas(false);
  };

  const handleLimitChange = (newLimit) => {
    setPageLimit(newLimit);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  const handleDelete = async (customCakeSizeid) => {
    try {
      const response = await axios.delete(
        deleteCustomCakeSizeByIdRoute(customCakeSizeid)
      );
      if (response.status === 200) {
        toast.success("Custom Cake Size deleted successfully", {
          autoClose: 1000,
        });
        setCustomCakeSizes((prev) =>
          prev.filter((item) => item.id !== customCakeSizeid)
        );
      }
    } catch (error) {
      console.error("Error deleting custom cake size", error);
    }
  };

  const showDeleteConfirmation = async (customCakeSizeId) => {
    const confirmed = await confirmDialog({
      message: "Are you sure you want to delete this Custom Cake size?",
    });
    if (confirmed) {
      handleDelete(customCakeSizeId);
    }
  };
  const addCustomCakeSize = (newCustomCakeSize) => {
    setCustomCakeSizes((prev) => [newCustomCakeSize, ...prev]);
    setShowOffcanvas(false);
  };

  const updateCustomCakeSize = (updatedCustomCakeSize) => {
    setCustomCakeSizes((prev) =>
      prev.map((customCakeSize) =>
        customCakeSize.id === updatedCustomCakeSize.id ? updatedCustomCakeSize : customCakeSize
      )
    );
    setShowOffcanvas(false);
  };

  const handleSortChange = (field) =>
    Common.handleSortingChange(field, setSortField, setSortOrder);

  const handleStatusToggle = async (customCakeSize, checked) => {
    const nextStatus = checked ? "active" : "inactive";
    const previous = customCakeSize.status;
    setCustomCakeSizes((prev) =>
      prev.map((row) =>
        row.id === customCakeSize.id ? { ...row, status: nextStatus } : row,
      ),
    );
    try {
      const fd = new FormData();
      fd.append("status", nextStatus);
      await axios.put(updateCustomCakeSizeByIdRoute(customCakeSize.id), fd);
    } catch (error) {
      setCustomCakeSizes((prev) =>
        prev.map((row) =>
          row.id === customCakeSize.id ? { ...row, status: previous } : row,
        ),
      );
      toast.error(
        error?.response?.data?.message || "Failed to update status.",
      );
    }
  };

  return (
    <>
      <section className="mt-3">
        <div className="">
        <div className="d-flex justify-content-between mb-3">
          <p className="pagetitle mb-0 fnt-color">Custom Cake Sizes</p>
          <div>
            <div
              className="btn-orange text-white fs-16 text-center"
              onClick={showOffcanvasOnAddCustomCakesSize}
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
                      onClick={() => handleSortChange("custom_cake_type_id")}>
                      Cake Type
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "custom_cake_type_id" &&
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
                      onClick={() => handleSortChange("status")}>
                      Status
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "status" &&
                        (sortOrder === "asc" ? "↑" : "↓")) ||
                        "↑↓"}
                    </span>
                    </th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customCakeSizes.map((customCakeSize, index) => (
                    <tr key={customCakeSize?.id}>
                      <td className="fw-normal fs-14 fnt-color">
                        {customCakeSize?.id}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {customCakeSize?.name_en}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {customCakeSize?.slug}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {Array.isArray(customCakeSize?.customCakeTypes)
                          ? customCakeSize.customCakeTypes.map((t) => t.name_en).join(", ")
                          : customCakeSize?.customCakeTypes?.name_en}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        <img
                          src={marbleUploadUrl(customCakeSize.image_url)}
                          className="image-fluid rounded-4"
                        />
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        <StatusToggle
                          id={`status-${customCakeSize.id}`}
                          showLabel={false}
                          checked={customCakeSize?.status === "active"}
                          onChange={(checked) =>
                            handleStatusToggle(customCakeSize, checked)
                          }
                          aria-label="Toggle status"
                        />
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <div
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() =>showOffcanvasOnEditCustomCakesSize(customCakeSize)}>
                            <i className="bi bi-pencil-square text-primary"></i>
                          </div>
                          <div
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() =>showDeleteConfirmation(customCakeSize?.id) }>
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
                  {customCakeSizeData
                    ? "Update Custom Cake Size"
                    : "Add Custom Cake Size"}
                </div>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <hr className="mt-0" />
            <Offcanvas.Body>
              <AddCustomCakeSize
                customCakeSizeData={customCakeSizeData}
                onAddCustomCakeSize={addCustomCakeSize}
                onUpdateCustomCakeSize={updateCustomCakeSize}
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
