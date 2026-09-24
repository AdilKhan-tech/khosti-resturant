"use client";
import React, { use } from "react";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useEffect, useState } from "react";
import { getGendersRoute,deleteGenderByIdRoute } from "@/utils/apiRoutes";
import Offcanvas from "react-bootstrap/Offcanvas";
import AddGender from "@/components/dashboard/product/AddGender";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import Common from "@/utils/Common"

export default function GenderPage() {
  const { token } = useAxiosConfig();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [genderData , setGenderData] = useState(null)
  const [genders, setGenders] = useState([]);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC")

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [keywords, setKeywords] = useState("");
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchAllGenders = async () => {
    if (!token) return;
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords: keywords,
        sortOrder,
        sortField,
      }
      const response = await axios.get(getGendersRoute, { params });
      setGenders(response.data.data);
      setTotalEntries(response.data.pagination.total);
      setPageCount(response.data.pagination.pageCount);
    } catch (error) {
      console.error("Error fetching genders", error);
    }
  };

  useEffect(() => {
    if (keywords != "") {
      if (keywords.trim() == "") return;
      const delay = setTimeout(() => {
        fetchAllGenders();
      }, 500);
      return () => clearTimeout(delay);
    } else {
      fetchAllGenders();
    }
  }, [currentPage, pageLimit, keywords, sortOrder, sortField, token]);


  const showOffcanvasOnAddGender = () => {
    setGenderData(null);
    setShowOffcanvas(true);
  };

  const showOffcanvasOnEditGender = (gender) => {
    setGenderData(gender);
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

  const handleDelete = async (genderId) => {
    try {
      const response = await axios.delete(deleteGenderByIdRoute(genderId));
      if (response.status === 200) {
        toast.success("Gender deleted successfully!", { autoClose: 1000 });
        setGenders((prev) => prev.filter((gender) => gender.id !== genderId));
      }
    } catch (error) {
      toast.error("Failed to delete Gender.");
    }
  };

  const showDeleteConfirmation = (genderId) => {
    if (confirm("Are you sure you want to delete this Gender?")) {
      handleDelete(genderId);
    }
  };

  const addGender = (newGender) => {
    setGenders((prev) => [newGender, ...prev]);
    setShowOffcanvas(false);
  };

  const updateGender = (updatedGender) => {
    setGenders((prev) =>
      prev.map((item) =>
        item.id === updatedGender.id ? updatedGender : item
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
        <p className="pagetitle mb-0 fnt-color">Genders</p>
        <div>
          <div
            className="btn-orange text-white fs-16 text-center"
            role="button"
            onClick={showOffcanvasOnAddGender}
          >
            <i className="bi bi-plus-circle ms-2"></i>
            <span className="ms-1">Create</span>
          </div>
        </div>
        </div>
          <div className="d-flex">
            <i className="bi bi-search fs-5 px-3 py-2 text-secondary position-absolute"></i>
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
                    onClick={() => handleSortChange("parent_gender")}>
                    Parent Gender
                    <span className="fs-10 text-secondary ms-1">
                      {(sortField === "parent_gender" &&
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
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {genders.map((gender, index) => (
                  <tr key={`${gender.id}-${index}`}>
                    <td className="fw-normal fs-14 fnt-color">
                      {gender.id}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {gender.name_en}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {gender.parent_gender}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {gender.slug}
                    </td>

                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                          onClick={() => showOffcanvasOnEditGender(gender)}
                        >
                          <i className="bi bi-pencil-square text-primary"></i>
                        </button>
                        <button
                          className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                          onClick={() => showDeleteConfirmation(gender.id)}
                        >
                          <i className="bi bi-trash text-danger"></i>
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
                {genderData ? "Update Gender": "Add Gender"}
              </div>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <hr className="mt-0" />
          <Offcanvas.Body>
            <AddGender
              closePopup={closePopup}
              genderData = {genderData}
              onAddGender = {addGender}
              onUpdateGender ={updateGender}
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
