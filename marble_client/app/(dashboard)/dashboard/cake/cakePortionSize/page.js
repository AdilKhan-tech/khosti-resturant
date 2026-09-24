'use client';
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import React from 'react'
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { toast, ToastContainer } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import axios from 'axios';
import AddCakePortionSize from '@/components/dashboard/cake/AddCakePortionSize';
import { useEffect, useState } from 'react';
import { getCakePortionSizesRoute, deleteCakePortionSizeByIdRoute } from '@/utils/apiRoutes';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Common from "@/utils/Common"
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";

export default function CakePortionSizePage() {
  const {token} = useAxiosConfig();
  const [cakePortionSizes, setCakePortionSizes] = useState([]);
  const [rawCakePortionSizes, setRawCakePortionSizes] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [cakePortionSizeData, setCakePortionSizeData] = useState(null);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC")

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [keywords, setKeywords] = useState("");
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchCakePortionSizes = async () => {
    if (!token) return;
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords: keywords,
        sortOrder,
        sortField,
      }
       const response = await axios.get(getCakePortionSizesRoute, { params });
       const rawData = response.data.data;

        // 🔥 VERY IMPORTANT
      setRawCakePortionSizes(rawData);
      const tree = Common.buildCategoryTree(rawData);
      const flatList = Common.flattenCategories(tree);

      setCakePortionSizes(flatList);
      setTotalEntries(response.data.pagination.total);
      setPageCount(response.data.pagination.pageCount);

    } catch (error) {
      console.error("Error fetching Cake Portion Sizes", error);
    }
  };

  useEffect(() => {
    if (keywords != "") {
      if (keywords.trim() == "") return;
      const delay = setTimeout(() => {
        fetchCakePortionSizes();
      }, 500);
      return () => clearTimeout(delay);
    } else {
      fetchCakePortionSizes();
    }
  }, [currentPage, pageLimit, keywords, sortOrder, sortField, token]);

  useEffect(() => {
    const tree = Common.buildCategoryTree(rawCakePortionSizes);
    const flatList = Common.flattenCategories(tree);
    setCakePortionSizes(flatList);
  }, [rawCakePortionSizes]);

  const showOffcanvasAddCakePortionSize = () => {
    setCakePortionSizeData(null);
    setShowOffcanvas(true);
  }

  const showOffcanvasOnEditCakePortionSizes = (cakePortionSize) => {
    setCakePortionSizeData(cakePortionSize);
    setShowOffcanvas(true);
  }

  const closePopup = () => {
    setShowOffcanvas(false);
  };

  const handleLimitChange = (newLimit) => {
    setPageLimit(newLimit);
    setCurrentPage(1);
  };

  const handleDelete = async (cakePortionSizeId) => {
    try {
      const response = await axios.delete(deleteCakePortionSizeByIdRoute(cakePortionSizeId));
      if(response.status === 200) {
        toast.success("Custom Cake Type deleted successfully!", {autoClose: 1000});
        setRawCakePortionSizes((prev) =>
          prev.filter((cakePortionSize) => cakePortionSize.id !== cakePortionSizeId)
        );
      }
    }catch (error){
      console.error("Error deleting Cake Portion Size", error);
      toast.error("Failed to delete Cake Portion Size");
    }
  }

  const showDeleteConfirmation = async (cakePortionSizeId) => {
    const confirmed = await confirmDialog({ message: "Are you sure you want to delete this Cake Portion Size?" });
    if(confirmed){
        handleDelete(cakePortionSizeId)
    }
  }

  const addCakePortionSize = (newCakePortionSize ) => {
    setShowOffcanvas(false);

    // 🔹 Always increase total count
    setTotalEntries(prev => prev + 1);

    // 🔹 Only update UI if user is on page 1
    // and sorting is latest first
    if (currentPage === 1 && sortField === "id" && sortOrder === "DESC") {

      setRawCakePortionSizes(prev => {
        const updated = [newCakePortionSize, ...prev];

        // Maintain page size
        if (updated.length > pageLimit) {
          updated.pop();
        }

        return updated;
      });
    }
  };

  const updateCakePortionSize = (updatedCakePortionSize) => {
    setRawCakePortionSizes(prev =>
      prev.map(item =>
        item.id === updatedCakePortionSize.id
          ? { ...item, ...updatedCakePortionSize }
          : item
      )
    );
    setShowOffcanvas(false);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSortChange = (field) =>
    Common.handleSortingChange(field, setSortField, setSortOrder);

  return (
    <>
    <section className="mt-3">
      <div>
        <div className='d-flex justify-content-between mb-3'>
          <p className="pagetitle mb-0 fnt-color">Cake Portion Sizes</p>
          <div >
            <div
              className='btn-orange text-white fs-16 text-center'
              onClick={showOffcanvasAddCakePortionSize}
              role='button'
            >
              <i className='bi bi-plus-circle ms-2'></i><span className='ms-1'>Create</span>
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
                    onClick={() => handleSortChange("parent_id")}>
                    Parent Portion Size
                    <span className="fs-10 text-secondary ms-1">
                      {(sortField === "parent_id" &&
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
                  <th className="fw-medium fs-14 fnt-color text-nowrap">Action</th>
                </tr>
              </thead>

              <tbody>
               {cakePortionSizes.map((cakePortionSize, index) => (
                    <tr key={cakePortionSize?.id}>
                      <td className="fw-normal fs-14 fnt-color">
                        {cakePortionSize?.id}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {"— ".repeat(cakePortionSize.level || 0)}
                        {cakePortionSize.name_en}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {cakePortionSize.slug}
                      </td>
                      <td>
                        {cakePortionSize.parent ? cakePortionSize.parent.name_en : "—"}
                      </td>
                        <td className="fw-normal fs-14 fnt-color">
                        <img
                          src={marbleUploadUrl(cakePortionSize.image_url)}
                          className="image-fluid rounded-5"
                        />
                      </td>
                    <td>
                      <div className='d-flex gap-1'>
                        <div className='action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2' onClick={() => showOffcanvasOnEditCakePortionSizes(cakePortionSize)}>
                          <i className="bi bi-pencil-square text-primary"></i></div>
                        <div className='action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2' onClick={() => showDeleteConfirmation(cakePortionSize.id)}>
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
                {cakePortionSizeData ? "Update Cake Portion Size" : "Add Cake Portion Size"}
              </div>
            </Offcanvas.Title>
            </Offcanvas.Header>
            <hr  className="mt-0"/>
            <Offcanvas.Body>
              <AddCakePortionSize
                cakePortionSizeData={cakePortionSizeData}
                closePopup={closePopup}
                onAddCakePortionSize={addCakePortionSize}
                onUpdateCakePortionSize={updateCakePortionSize}
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
