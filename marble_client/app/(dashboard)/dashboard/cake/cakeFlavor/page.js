'use client';
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import React from 'react'
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { toast, ToastContainer } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import axios from 'axios';
import AddCakeFlavor from "@/components/dashboard/cake/AddCakeFlavor";
import { useEffect, useState } from 'react';
import { getCakeFlavorsRoute, deleteCakeFlavorByIdRoute, updateCakeFlavorByIdRoute } from '@/utils/apiRoutes';
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import Offcanvas from 'react-bootstrap/Offcanvas';
import Common from "@/utils/Common"

export default function CakeFlavorPage() {
  const {token} = useAxiosConfig();
  const [cakeFlavors, setCakeFlavors] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [cakeFlavorData, setCakeFlavorData] = useState(null);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC")

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [keywords, setKeywords] = useState("");
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchCakeFlavors = async () => {
    if (!token) return;
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords: keywords,
        sortOrder,
        sortField,
      }
      const response = await axios.get(getCakeFlavorsRoute, { params });
      setCakeFlavors(response.data.data);
      setTotalEntries(response.data.pagination.total);
      setPageCount(response.data.pagination.pageCount);

    } catch (error) {
      console.error("Error fetching cake Flavors", error);
    }
  };

  useEffect(() => {
    if (keywords != "") {
      if (keywords.trim() == "") return;
      const delay = setTimeout(() => {
        fetchCakeFlavors();
      }, 500);
      return () => clearTimeout(delay);
    } else {
      fetchCakeFlavors();
    }
  }, [currentPage, pageLimit, keywords, sortOrder, sortField, token]);

  const showOffcanvasOnAddCakesFlavor = () => {
    setCakeFlavorData(null);
    setShowOffcanvas(true);
  }

  const showOffcanvasOnEditCakesFlavor = (flavor) => {
    setCakeFlavorData(flavor);
    setShowOffcanvas(true);
  }

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

  const handleDelete = async (flavorId) => {
    try {
      const response = await axios.delete(deleteCakeFlavorByIdRoute(flavorId));
      if(response.status === 200) {
        toast.success("Cake flavor deleted successfully!", {autoClose: 1000});
        setCakeFlavors((prev) =>
          prev.filter((cakeFlavor) => cakeFlavor.id !== flavorId)
        );
      }
    }catch (error){
      console.error("Error deleting Cake flavor:", error);
      toast.error("Failed to delete Cake flavor.");
    }
  }

  const showDeleteConfirmation = async (flavorId) => {
    const confirmed = await confirmDialog({ message: "Are you sure you want to delete this Cake flavor?" });
    if(confirmed){
        handleDelete(flavorId)
    }
  }

  const addCakeFlavor = (newCakeFlavor) => {
    setCakeFlavors(prev => [newCakeFlavor, ...prev]);
    setShowOffcanvas(false);
  };

  const updateCakeFlavor = (updatedCakeFlavor) => {
    setCakeFlavors((prev) =>
      prev.map((cakeFlavor) =>
        cakeFlavor.id === updatedCakeFlavor.id ? { ...cakeFlavor, ...updatedCakeFlavor } : cakeFlavor
      )
    );
    setShowOffcanvas(false);
  };

  const handleSortChange = (field) =>
    Common.handleSortingChange(field, setSortField, setSortOrder);

  const handleStatusToggle = async (cakeFlavor, checked) => {
    const nextStatus = checked ? "active" : "inactive";
    const previous = cakeFlavor.status;
    setCakeFlavors((prev) =>
      prev.map((row) =>
        row.id === cakeFlavor.id ? { ...row, status: nextStatus } : row,
      ),
    );
    try {
      const fd = new FormData();
      fd.append("status", nextStatus);
      await axios.put(updateCakeFlavorByIdRoute(cakeFlavor.id), fd);
    } catch (error) {
      setCakeFlavors((prev) =>
        prev.map((row) =>
          row.id === cakeFlavor.id ? { ...row, status: previous } : row,
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
      <div>
        <div className='d-flex justify-content-between mb-3'>
        <p className="pagetitle mb-0 fnt-color">Cake Flavors</p>
        <div >
          <div className='btn-orange text-white fs-16 text-center' onClick={showOffcanvasOnAddCakesFlavor} role='button'>
          <i className='bi bi-plus-circle ms-2'></i>
          <span className='ms-1'>Create</span>
          </div>
        </div>
        </div>
          <div className='d-flex'>
            <i className='bi bi-search fs-5 px-3 py-1 text-secondary position-absolute'></i>
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
                <tr className=''>
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
                    onClick={() => handleSortChange("cake_category_id")}>
                    Cake Type
                    <span className="fs-10 text-secondary ms-1">
                      {(sortField === "cake_category_id" &&
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
                {cakeFlavors.map((cakeFlavor, index) => (
                  <tr key={cakeFlavor?.id}>
                    <td className="fw-normal fs-14 fnt-color">
                      {cakeFlavor?.id}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {cakeFlavor?.name_en}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {cakeFlavor?.cakeCategory?.name_en}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {cakeFlavor?.slug}
                    </td>
                      <td className="fw-normal fs-14 fnt-color">
                        <img
                          src={marbleUploadUrl(cakeFlavor.image_url)}
                          className="image-fluid rounded-4"
                        />
                      </td>
                    <td className="fw-normal fs-14 fnt-color">
                      <StatusToggle
                        id={`status-${cakeFlavor.id}`}
                        showLabel={false}
                        checked={cakeFlavor?.status === "active"}
                        onChange={(checked) =>
                          handleStatusToggle(cakeFlavor, checked)
                        }
                        aria-label="Toggle status"
                      />
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2 " onClick={() => showOffcanvasOnEditCakesFlavor(cakeFlavor)}>
                          <i className="bi bi-pencil-square text-primary"></i>
                        </button>
                        <button className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2 " onClick={() => showDeleteConfirmation(cakeFlavor.id)}>
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
          placement="end">
          <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <div className='fs-24 fnt-color'>
              {cakeFlavorData ? "Update Cake Flavor" : "Add Cake Flavor"}
            </div>
          </Offcanvas.Title>
          </Offcanvas.Header>
          <hr  className="mt-0"/>
          <Offcanvas.Body>
            <AddCakeFlavor
              cakeFlavorData={cakeFlavorData}
              closePopup={closePopup}
              onAddCakeFlavor={addCakeFlavor}
              onUpdateCakeFlavor={updateCakeFlavor}
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
  )
}
