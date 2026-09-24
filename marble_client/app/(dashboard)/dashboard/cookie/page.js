"use client";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import AddCookie from "@/components/dashboard/cookies/AddCookie";
import { ToastContainer, toast } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import Offcanvas from "react-bootstrap/Offcanvas";
import { getCookiesRoute, deleteCookieByIdRoute, updateCookieByIdRoute } from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import Common from "@/utils/Common"

export default function Cookies() {
  const { token } = useAxiosConfig();
  const [cookies, setCookies] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [cookieData, setCookieData] = useState(null);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC")

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [keywords, setKeywords] = useState("");
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);;

  const fetchCookies = async () => {
    if (!token) return;
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords: keywords,
        sortOrder,
        sortField,
      }
      const response = await axios.get(getCookiesRoute, { params });
      setCookies(response?.data?.data);
      setTotalEntries(response.data.pagination.total);
      setPageCount(response.data.pagination.pageCount);
    } catch (error) {
      console.error("Error fetching Cookie", error);
    }
  };

  useEffect(() => {
    if (keywords != "") {
      if (keywords.trim() == "") return;
      const delay = setTimeout(() => {
        fetchCookies();
      }, 500);
      return () => clearTimeout(delay);
    } else {
      fetchCookies();
    }
  }, [currentPage, pageLimit, keywords, sortOrder, sortField, token]);

  const showOffcanvasOnAddCookies = () => {
    setCookieData(null);
    setShowOffcanvas(true);
  };

  const showOffcanvasOnEditCookies = (cookies) => {
    setCookieData(cookies);
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

  const handleDelete = async (cookieId) => {
    try {
      const response = await axios.delete(deleteCookieByIdRoute(cookieId));
      if (response.status === 200) {
        toast.success("Cookie deleted successfully!", { autoClose: 1000 });
        setCookies((prev) => prev.filter((cookie) => cookie.id !== cookieId));
      }
    } catch (error) {
      toast.error("Failed to delete Cookie.");
    }
  };

  const showDeleteConfirmation = async (cookiesId) => {
    const confirmed = await confirmDialog({
      message: "Are you sure you want to delete this Cookie?",
    });
    if (confirmed) {
      handleDelete(cookiesId);
    }
  };

  const addCookie = (newCookie) => {
    setCookies((prev) => [newCookie, ...prev]);
    setShowOffcanvas(false);
  };

  const updateCookie = (updatedCookie) => {
    setCookies((prev) =>
      prev.map((cookie) =>
        cookie.id === updatedCookie.id
          ? { ...cookie, ...updatedCookie }
          : cookie
      )
    );
    setShowOffcanvas(false);
  };

  const handleSortChange = (field) =>
    Common.handleSortingChange(field, setSortField, setSortOrder);

  const handleStatusToggle = async (cookie, checked) => {
    const nextStatus = checked ? "active" : "inactive";
    const previous = cookie.status;
    setCookies((prev) =>
      prev.map((row) =>
        row.id === cookie.id ? { ...row, status: nextStatus } : row,
      ),
    );
    try {
      const fd = new FormData();
      fd.append("status", nextStatus);
      await axios.put(updateCookieByIdRoute(cookie.id), fd);
    } catch (error) {
      setCookies((prev) =>
        prev.map((row) =>
          row.id === cookie.id ? { ...row, status: previous } : row,
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
      <div className="d-flex justify-content-between mb-3">
        <p className="pagetitle mb-0 fnt-color">Cookies</p>
        <div>
          <button
            className="btn-orange text-white fs-16"
            role="button"
            onClick={showOffcanvasOnAddCookies}
          >
            <i className="bi bi-plus-circle me-1"></i>
            <span className="me-2">Create</span>
          </button>
        </div>
      </div>
          <div className="d-flex gap-5">
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
                    onClick={() => handleSortChange("cookie_type_id")}>
                    Cookie Box Type
                    <span className="fs-10 text-secondary ms-1">
                      {(sortField === "cookie_type_id" &&
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
                {cookies.map((cookie, index) => (
                  <tr key={cookie.id || cookie.id || index}>
                    <td className="fw-normal fs-14 fnt-color">
                      {cookie?.id}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {cookie?.name_en}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {Array.isArray(cookie?.cookieBoxTypes)
                        ? cookie.cookieBoxTypes.map((t) => t.name_en).join(", ")
                        : cookie?.type?.name_en || "N/A"}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {cookie?.slug}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      <img
                        src={marbleUploadUrl(cookie.image_url)}
                        className="image-fluid rounded-5"
                      />
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      <StatusToggle
                        id={`status-${cookie.id}`}
                        showLabel={false}
                        checked={cookie?.status === "active"}
                        onChange={(checked) =>
                          handleStatusToggle(cookie, checked)
                        }
                        aria-label="Toggle status"
                      />
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <div
                          className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                          onClick={() => showOffcanvasOnEditCookies(cookie)}
                        >
                          <i className="bi bi-pencil-square text-primary"></i>
                        </div>
                        <div
                          className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                          onClick={() => showDeleteConfirmation(cookie?.id)}
                        >
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
                {cookieData ? "Update Cookie" : "Add Cookie"}
              </div>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <hr className="mt-0" />
          <Offcanvas.Body>
            <AddCookie
              cookieData={cookieData}
              closePopup={closePopup}
              onAddCookie={addCookie}
              onUpdateCookie={updateCookie}
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
