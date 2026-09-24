"use client";
import React from "react";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import Offcanvas from "react-bootstrap/Offcanvas";
import axios from "axios";
import AddBranch from '@/components/dashboard/fulfillment/AddBranch';
import { getBranchesRoute, deleteBranchByIdRoute } from "@/utils/apiRoutes";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import Common from "@/utils/Common"
import { formatBranchStatusLabel } from "@/utils/branchStatus";

export default function BranchPage() {
  const { token } = useAxiosConfig();
  const [branches, setBranches] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [branchData, setBranchData] = useState(null);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC")

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [keywords, setKeywords] = useState("");
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchBranches = async () => {
    if (!token) return;
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords: keywords,
        sortOrder,
        sortField,
      }
      const response = await axios.get(getBranchesRoute, { params });
      setBranches(response.data.data);
      setTotalEntries(response.data.pagination.total);
      setPageCount(response.data.pagination.pageCount);
    } catch (error) {
      console.error("Error fetching cake sizes", error);
    }
  };

  useEffect(() => {
    if (keywords != "") {
      if (keywords.trim() == "") return;
      const delay = setTimeout(() => {
        fetchBranches();
      }, 500);
      return () => clearTimeout(delay);
    } else {
      fetchBranches();
    }
  }, [currentPage, pageLimit, keywords, sortOrder, sortField, token]);

  const showOffcanvasOnEditBranch = (branch) => {
    setBranchData(branch);
    setShowOffcanvas(true);
  }

  const showOffcanvasOnAddBranch = () => {
    setBranchData(null);
    setShowOffcanvas(true)
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

  const handleDelete = async (branchId) => {
    try {
      const response = await axios.delete(deleteBranchByIdRoute(branchId));
      if(response.status === 200) {
          toast.success("Branch deleted successfully!", {autoClose: 1000});
          setBranches((prev) =>
            prev.filter((branch) => branch.id !== branchId)
          );
      }
    }catch (error){
      console.error("Error deleting branch", error);
      toast.error("Failed to delete branch");
    }
  }

  const showDeleteConfirmation = async (branchId) => {
    const confirmed = await confirmDialog({ message: "Are you sure you want to delete this Branch?" });
    if(confirmed){
        handleDelete(branchId)
    }
  }

  const addBranch = (newBranch) => {
    setBranches(prev => [newBranch, ...prev]);
    setShowOffcanvas(false);
  };

  const updateBranch = (updatedBranch) => {
    setBranches((prev) =>
      prev.map((branch) =>
        branch.id === updatedBranch.id ? updatedBranch : branch
      )
    );
    setShowOffcanvas(false);
  };


  const handleSortChange = (field) =>
    Common.handleSortingChange(field, setSortField, setSortOrder);

  return (
    <>
    <section className="mt-3">
      <div className="">
      <div className="d-flex justify-content-between mb-3">
        <p className="pagetitle mb-0 fnt-color">Branches</p>
        <div>
          <button
            className="btn-orange text-white fs-16"
            onClick={showOffcanvasOnAddBranch}
            role="button"
          >
            <i className="bi bi-plus-circle"></i>
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
                    onClick={() => handleSortChange("status")}>
                    Status
                    <span className="fs-10 text-secondary ms-1">
                      {(sortField === "status" &&
                      (sortOrder === "asc" ? "↑" : "↓")) ||
                      "↑↓"}
                    </span>
                  </th>
                  <th
                    className="fw-medium fs-14 fnt-color text-nowrap"
                    onClick={() => handleSortChange("city")}>
                    City
                    <span className="fs-10 text-secondary ms-1">
                      {(sortField === "city" &&
                      (sortOrder === "asc" ? "↑" : "↓")) ||
                      "↑↓"}
                    </span>
                  </th>
                  <th className="fw-medium fs-14 fnt-color text-nowrap" >Action</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch, index) => (
                  <tr key={branch?.id}>
                    <td className="fw-normal fs-14 fnt-color">
                      {branch?.id}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {branch?.name_en}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {branch?.slug}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {formatBranchStatusLabel(branch?.status)}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {branch?.city}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                          onClick={() => showOffcanvasOnEditBranch(branch)}
                        >
                          <i className="bi bi-pencil-square text-primary"></i>
                        </button>
                        <button
                          className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                          onClick={() => showDeleteConfirmation(branch.id)}
                        >
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
              {branchData ? "Update Branch" : "Add Branch"}
              </div>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <hr className="mt-0" />
          <Offcanvas.Body>
            <AddBranch
              branchData={branchData}
              closePopup={closePopup}
              onAddBranch={addBranch}
              onUpdateBranch={updateBranch}
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

