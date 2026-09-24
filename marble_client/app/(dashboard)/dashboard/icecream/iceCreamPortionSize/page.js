"use client";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import React from "react";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { toast, ToastContainer } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import axios from "axios";
import AddIceCreamSize from "@/components/dashboard/icecream/AddIceCreamPortionSize";
import { useEffect, useState } from "react";
import { getIceCreamPortionSizesRoute, deleteIceCreamPortionSizeByIdRoute, updateIceCreamPortionSizeByIdRoute } from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import Offcanvas from "react-bootstrap/Offcanvas";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import Common from "@/utils/Common"

export default function IceCreamPortionSizePage() {
  const { token } = useAxiosConfig();
  const [iceCreamPortionSizes, setIceCreamPortionSizes] = useState([]);
  const [rawIceCreamPortionSizes, setRawIceCreamPortionSizes] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [iceCreamPortionData, setIceCreamPortionSizeData] = useState(null);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC")

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [keywords, setKeywords] = useState("");
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchIceCreamPortionSizes = async () => {
    if (!token) return;
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords: keywords,
        sortOrder,
        sortField,
      }
      const response = await axios.get(getIceCreamPortionSizesRoute, { params });
      const rawData = response.data.data;
      // 🔥 VERY IMPORTANT
      setRawIceCreamPortionSizes(rawData);

      const tree = Common.buildCategoryTree(rawData);
      const flatList = Common.flattenCategories(tree);

      setIceCreamPortionSizes(flatList);
      setTotalEntries(response.data.pagination.total);
      setPageCount(response.data.pagination.pageCount);

    } catch (error) {
      console.error("Error fetching icecream Portion Sizes", error);
    }
  };

  useEffect(() => {
    if (keywords != "") {
      if (keywords.trim() == "") return;
      const delay = setTimeout(() => {
        fetchIceCreamPortionSizes();
      }, 500);
      return () => clearTimeout(delay);
    } else {
      fetchIceCreamPortionSizes();
    }
  }, [currentPage, pageLimit, keywords, sortOrder, sortField, token]);

  useEffect(() => {
    const tree = Common.buildCategoryTree(rawIceCreamPortionSizes);
    const flatList = Common.flattenCategories(tree);
    setIceCreamPortionSizes(flatList);
  }, [rawIceCreamPortionSizes]);

  const showOffcanvasOnAddCakesSize = () => {
    setIceCreamPortionSizeData(null);
    setShowOffcanvas(true);
  };

  const showOffcanvasOnEditCakesSize = (icecream) => {
    setIceCreamPortionSizeData(icecream);
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

  const handleDelete = async (iceCreamId) => {
    try {
      const response = await axios.delete(deleteIceCreamPortionSizeByIdRoute(iceCreamId));
      if(response.status === 200) {
        toast.success("Ice Cream portion size deleted successfully!", {autoClose: 1000});
        setRawIceCreamPortionSizes((prev) =>
          prev.filter((iceCreamPortionSize) => iceCreamPortionSize.id !== iceCreamId)
        );
      }
    } catch (error) {
      console.error("Error deleting Ice Cream size:", error);
      toast.error("Failed to delete Ice Cream size.");
    }
  };

  const showDeleteConfirmation = async (iceCreamId) => {
    const confirmed = await confirmDialog({
      message: "Are you sure you want to delete this Ice Cream size?",
    });
    if (confirmed) {
      handleDelete(iceCreamId);
    }
  };

  const addIceCreamPortionSize = (newIceCreamPortionSize ) => {
    setShowOffcanvas(false);

    // 🔹 Always increase total count
    setTotalEntries(prev => prev + 1);

    // 🔹 Only update UI if user is on page 1
    // and sorting is latest first
    if (currentPage === 1 && sortField === "id" && sortOrder === "DESC") {

      setRawIceCreamPortionSizes(prev => {
        const updated = [newIceCreamPortionSize, ...prev];

        // Maintain page size
        if (updated.length > pageLimit) {
          updated.pop();
        }

        return updated;
      });
    }
  };

  const updateIceCreamPortionSize = (updatedIceCreamPortionSize) => {
    setRawIceCreamPortionSizes(prev =>
      prev.map(item =>
        item.id === updatedIceCreamPortionSize.id
          ? { ...item, ...updatedIceCreamPortionSize }
          : item
      )
    );

    setShowOffcanvas(false);
  };

  const handleSortChange = (field) =>
    Common.handleSortingChange(field, setSortField, setSortOrder);

  const handleStatusToggle = async (icecream, checked) => {
    const nextStatus = checked ? "Active" : "Inactive";
    const previous = icecream.status;
    setIceCreamPortionSizes((prev) =>
      prev.map((row) =>
        row.id === icecream.id ? { ...row, status: nextStatus } : row,
      ),
    );
    try {
      const fd = new FormData();
      fd.append("status", nextStatus);
      await axios.put(updateIceCreamPortionSizeByIdRoute(icecream.id), fd);
    } catch (error) {
      setIceCreamPortionSizes((prev) =>
        prev.map((row) =>
          row.id === icecream.id ? { ...row, status: previous } : row,
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
          <p className="pagetitle fnt-color">Ice Cream Portion Sizes</p>
          <div>
            <div
              className="btn-orange text-white fs-16 text-center"
              onClick={showOffcanvasOnAddCakesSize}
              role="button"
            >
              <i className="bi bi-plus-circle me-2"></i>
              <span>Create</span>
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
                      onClick={() => handleSortChange("parent_id")}
                    >
                      Parent Portion Size
                    <span className="fs-10 text-secondary ms-1">
                      {(sortField === "parent_id" &&
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
                  {iceCreamPortionSizes.map((icecream, index) => (
                    <tr key={`${icecream.id}-${index}`}>

                      <td className="fw-normal fs-14 fnt-color">
                        {icecream.id}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {"— ".repeat(icecream.level || 0)}
                        {icecream.name_en}
                      </td>
                      <td>
                        {icecream.parent ? icecream.parent.name_en : "—"}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {icecream.slug}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        <img
                          src={marbleUploadUrl(icecream.image_url)}
                          className="image-fluid rounded-5"
                        />
                        </td>
                      <td className="fw-normal fs-14 fnt-color">
                        <StatusToggle
                          id={`status-${icecream.id}`}
                          showLabel={false}
                          checked={icecream?.status === "Active"}
                          onChange={(checked) =>
                            handleStatusToggle(icecream, checked)
                          }
                          aria-label="Toggle status"
                        />
                      </td>

                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() =>
                              showOffcanvasOnEditCakesSize(icecream)
                            }
                          >
                            <i className="bi bi-pencil-square text-primary"></i>
                          </button>
                          <button
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() => showDeleteConfirmation(icecream.id)}
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
                  {iceCreamPortionData
                    ? "Update Ice Cream Portion Size"
                    : "Add Ice Cream Portion Size"}
                </div>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <hr className="mt-0" />
            <Offcanvas.Body>
              <AddIceCreamSize
                iceCreamPortionData={iceCreamPortionData}
                closePopup={closePopup}
                onAddIceCreamPortionSize={addIceCreamPortionSize}
                onUpdateIceCreamPortionSize={updateIceCreamPortionSize}
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
