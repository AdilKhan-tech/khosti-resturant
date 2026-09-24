"use client";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import React, { useEffect, useState } from "react";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import {getCustomCakeFlavorsRoute,deleteCustomCakeFlavorByIdRoute, updateCustomCakeFlavorByIdRoute,} from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import AddCustomCakeFlavor from "@/components/dashboard/cake/AddCustomCakeFlavor";
import Offcanvas from "react-bootstrap/Offcanvas";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";

import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import Common from "@/utils/Common"

function page() {
  const { token } = useAxiosConfig();
  const [customCakeFlavors, setCustomCakeFlavors] = useState([]);
  const [customCakeFlavorData, setCustomCakeFlavorData] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC")

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [keywords, setKeywords] = useState("");
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);


  const fetchAllCustomCakeFlavor = async () => {
    if (!token) return;
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords: keywords,
        sortOrder,
        sortField,
      }
      const response = await axios.get(getCustomCakeFlavorsRoute, { params });
      setCustomCakeFlavors(response.data.data);
      setTotalEntries(response.data.pagination.total);
      setPageCount(response.data.pagination.pageCount)
    } catch (error) {
      console.error("Error fetching Custom Cake Flavor", error);
    }
  };

  useEffect(() => {
    if (keywords != "") {
      if (keywords.trim() == "") return;
      const delay = setTimeout(() => {
        fetchAllCustomCakeFlavor();
      }, 500);
      return () => clearTimeout(delay);
    } else {
      fetchAllCustomCakeFlavor();
    }
}, [currentPage, pageLimit, keywords, sortOrder, sortField, token]);

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

  const handleDelete = async (customCakeFlavorId) => {
    try {
      const response = await axios.delete(
        deleteCustomCakeFlavorByIdRoute(customCakeFlavorId)
      );
      if (response.status === 200) {
        toast.success("Custom cake flavor deleted successfully!", {
          autoClose: 1000,
        });
        setCustomCakeFlavors((prev) =>
          prev.filter(
            (customCakeFlavor) => customCakeFlavor.id !== customCakeFlavorId
          )
        );
      }
    } catch (error) {
      toast.error("Failed to delete Custom Cake Flavor.");
    }
  };

  const showDeleteConfirmation = async (customCakeFlavorId) => {
    const confirmed = await confirmDialog({
      message: "Are you sure you want to delete this Custom Cake Flavor?",
    });
    if (confirmed) {
      handleDelete(customCakeFlavorId);
    }
  };

  const showOffcanvasOnAddCustomCakeFlavor = () => {
    setCustomCakeFlavorData(null);
    setShowOffcanvas(true);
  };

  const showOffcanvasOnEditCustomCakeFlavor = (customCakeFlavor) => {
    setCustomCakeFlavorData(customCakeFlavor);
    setShowOffcanvas(true);
  };

  const addCustomCakeFlavor = (newCustomCakeFlavor) => {
    setCustomCakeFlavors(prev => [newCustomCakeFlavor, ...prev]);
    setShowOffcanvas(false);
  };

  const updateCustomCakeFlavor = (updatedCustomCakeFlavor) => {
    setCustomCakeFlavors((prev) =>
      prev.map((customCakeFlavor) =>
        customCakeFlavor.id === updatedCustomCakeFlavor.id ? { ...customCakeFlavor, ...updatedCustomCakeFlavor } : customCakeFlavor
      )
    );
    setShowOffcanvas(false);
  };

  const handleSortChange = (field) =>
    Common.handleSortingChange(field, setSortField, setSortOrder);

  const handleStatusToggle = async (customCakeFlavor, checked) => {
    const nextStatus = checked ? "active" : "inactive";
    const previous = customCakeFlavor.status;
    setCustomCakeFlavors((prev) =>
      prev.map((row) =>
        row.id === customCakeFlavor.id ? { ...row, status: nextStatus } : row,
      ),
    );
    try {
      const fd = new FormData();
      fd.append("status", nextStatus);
      await axios.put(updateCustomCakeFlavorByIdRoute(customCakeFlavor.id), fd);
    } catch (error) {
      setCustomCakeFlavors((prev) =>
        prev.map((row) =>
          row.id === customCakeFlavor.id ? { ...row, status: previous } : row,
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
        <p className="pagetitle mb-0 fnt-color">Custom Cake Flavor</p>
        <div>
          <button
            className="btn-orange text-white fs-16"
            onClick={showOffcanvasOnAddCustomCakeFlavor}
            role="button">
            <i className="bi bi-plus-circle ms-1"></i>
            <span className="ms-2">Create</span>
          </button>
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
                {customCakeFlavors.map((customCakeFlavor, index) => (
                  <tr key={`${customCakeFlavor?.id}-${index}`}>
                    <td className="fw-normal fs-14 fnt-color">
                      {customCakeFlavor?.id}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {customCakeFlavor?.name_en}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {customCakeFlavor?.slug}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {Array.isArray(customCakeFlavor?.customCakeTypes)
                        ? customCakeFlavor.customCakeTypes.map((t) => t.name_en).join(", ")
                        : customCakeFlavor?.customCakeTypes?.name_en}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      <img
                        src={marbleUploadUrl(customCakeFlavor.image_url)}
                        className="image-fluid rounded-5"
                      />
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      <StatusToggle
                        id={`status-${customCakeFlavor.id}`}
                        showLabel={false}
                        checked={customCakeFlavor?.status === "active"}
                        onChange={(checked) =>
                          handleStatusToggle(customCakeFlavor, checked)
                        }
                        aria-label="Toggle status"
                      />
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                          onClick={() =>showOffcanvasOnEditCustomCakeFlavor(customCakeFlavor)}>
                          <i className="bi bi-pencil-square text-primary"></i>
                        </button>
                        <button
                          className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                          onClick={() =>showDeleteConfirmation(customCakeFlavor?.id)}>
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
        <Offcanvas
          show={showOffcanvas}
          onHide={() => setShowOffcanvas(false)}
          placement="end"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              <div className="fs-24 fnt-color">
                {customCakeFlavorData
                  ? "Update Custom Cake Flavor"
                  : "Add Custom Cake flavor"}
              </div>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <hr className="mt-0" />
          <Offcanvas.Body>
            <AddCustomCakeFlavor
              closePopup={closePopup}
              customCakeFlavorData={customCakeFlavorData}
              onUpdateCustomCakeFlavor = {updateCustomCakeFlavor}
              onAddCustomCakeFlavor = {addCustomCakeFlavor}
            />
          </Offcanvas.Body>
        </Offcanvas>
        <ToastContainer />
      </div>
    </section>
    <div className='d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mt-0'>
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

export default page;
