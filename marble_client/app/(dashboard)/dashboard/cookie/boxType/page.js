"use client";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import React from 'react'
import { useState , useEffect } from 'react';
import axios from 'axios';
import useAxiosConfig from '@/hooks/useAxiosConfig';
import AddCookieBoxType from '@/components/dashboard/cookies/AddCookieBoxType';
import { ToastContainer, toast } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { getCookieBoxTypesRoute, deleteCookieBoxTypeByIdRoute, updateCookieTypeByIdRoute } from '@/utils/apiRoutes';
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import Common from "@/utils/Common"

export default function CookieBoxTypePage() {

  const {token} = useAxiosConfig();
  const [cookieBoxTypes, setCookieBoxTypes] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [cookieBoxTypeData, setCookieBoxTypeData] = useState(null);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC")

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [keywords, setKeywords] = useState("");
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchCookieBoxTypes = async () => {
    if (!token) return;
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords: keywords,
        sortOrder,
        sortField,
      }
      const response = await axios.get(getCookieBoxTypesRoute, { params })
      setCookieBoxTypes(response?.data?.data);
      setTotalEntries(response.data.pagination.total);
      setPageCount(response.data.pagination.pageCount);
    }catch (error){
      console.error("Error fetching Cookie Box Types", error);
    }
  }

  useEffect(() => {
    if (keywords != "") {
      if (keywords.trim() == "") return;
      const delay = setTimeout(() => {
        fetchCookieBoxTypes();
      }, 500);
      return () => clearTimeout(delay);
    } else {
      fetchCookieBoxTypes();
    }
  }, [currentPage, pageLimit, keywords, sortOrder, sortField, token]);

  const showOffcanvasOnAddCookieType = () => {
    setCookieBoxTypeData(null);
    setShowOffcanvas(true);
  }

  const showOffcanvasOnEditCookieType = (cookieBoxType) => {
    setCookieBoxTypeData(cookieBoxType);
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

  const handleDelete = async (typeId) => {
    try {
      const response = await axios.delete(deleteCookieBoxTypeByIdRoute(typeId));
      if(response.status === 200) {
        toast.success("Cookie box Type deleted successfully!", { autoClose: 1000 });
        setCookieBoxTypes((prev) => prev.filter((type) => type.id !== typeId));
      }
    }catch (error){
      toast.error("Failed to delete Cookie box type.");
    }
  }

  const showDeleteConfirmation = async (typeId) => {
    const confirmed = await confirmDialog({ message: "Are you sure you want to delete this Cookie box type?" });
    if(confirmed){
      handleDelete(typeId)
    }
  }

  const addCookieBoxType = (newCookie) => {
    setCookieBoxTypes(prev => [newCookie, ...prev]);
    setShowOffcanvas(false);
  };

  const updateCookieBoxType = (updatedCookieBoxType) => {
    setCookieBoxTypes((prev) =>
      prev.map((cookieBoxType) =>
        cookieBoxType.id === updatedCookieBoxType.id ? updatedCookieBoxType : cookieBoxType
      )
    );
    setShowOffcanvas(false);
  };

  const handleSortChange = (field) =>
    Common.handleSortingChange(field, setSortField, setSortOrder);

  const handleStatusToggle = async (type, checked) => {
    const nextStatus = checked ? "active" : "inactive";
    const previous = type.status;
    setCookieBoxTypes((prev) =>
      prev.map((row) =>
        row.id === type.id ? { ...row, status: nextStatus } : row,
      ),
    );
    try {
      const fd = new FormData();
      fd.append("status", nextStatus);
      await axios.put(updateCookieTypeByIdRoute(type.id), fd);
    } catch (error) {
      setCookieBoxTypes((prev) =>
        prev.map((row) =>
          row.id === type.id ? { ...row, status: previous } : row,
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
      <div className='mt-3'>
      <div className='d-flex justify-content-between mb-3'>
        <p className='pagetitle mb-0 fnt-color'>Cookie Box Types</p>
        <div >
          <button
            className='btn-orange text-white fs-16'
            role='button'
            onClick={showOffcanvasOnAddCookieType}
          >
            <i className='bi bi-plus-circle me-2'></i>Create
          </button>
        </div>
        </div>
        <div className='d-flex gap-5'>
        <i className='bi bi-search fs-20 px-3 py-1 text-secondary position-absolute'></i>
          <input
            type='text'
            className='form-control form-control-lg px-5 text-dark-custom dashboard-search-input'
            placeholder='Search here...'
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>
      </div>

      <div className='px-0 pt-0 rounded-2 p-0 mt-3'>
        <div className='table-responsive'>
          <div className='data-table'>
            <table className='table datatable-wrapper'>
              <thead className=''>
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
                {cookieBoxTypes.map((type, index) => (
                  <tr key={type._id || type.id || index}>
                    <td className="fw-normal fs-14 fnt-color">
                      {type?.id}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {type?.name_en}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      {type?.slug}
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      <img
                        src={marbleUploadUrl(type.image_url)}
                        className="image-fluid rounded-5"
                      />
                    </td>
                    <td className="fw-normal fs-14 fnt-color">
                      <StatusToggle
                        id={`status-${type.id}`}
                        showLabel={false}
                        checked={type?.status === "active"}
                        onChange={(checked) =>
                          handleStatusToggle(type, checked)
                        }
                        aria-label="Toggle status"
                      />
                    </td>
                    <td>
                      <div className='d-flex gap-1'>
                        <div className='action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2' onClick={() => showOffcanvasOnEditCookieType(type)}>
                          <i className="bi bi-pencil-square text-primary"></i></div>
                        <div className='action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2' onClick={() => showDeleteConfirmation(type.id)}>
                          <i className="bi bi-trash text-danger"></i></div>
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
              {cookieBoxTypeData ? "Update Box Type" : "Add Box Type"}
            </div>
          </Offcanvas.Title>
          </Offcanvas.Header>
          <hr  className="mt-0"/>
          <Offcanvas.Body>
            <AddCookieBoxType
              cookieBoxTypeData={cookieBoxTypeData}
              closePopup={closePopup}
              onAddCookieBoxType={addCookieBoxType}
              onUpdateCookieBoxType={updateCookieBoxType}
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
