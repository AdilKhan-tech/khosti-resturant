'use client';
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { toast, ToastContainer } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import axios from 'axios';
import AddCakeSize from "@/components/dashboard/cake/AddCakeSize";
import { useEffect, useState } from 'react';
import { getCakeSizesRoute, deleteCakeSizeByIdRoute, updateCakeSizeByIdRoute } from '@/utils/apiRoutes';
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import Offcanvas from 'react-bootstrap/Offcanvas';
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import Common from "@/utils/Common"

export default function CakeSizePage() {
  const {token} = useAxiosConfig();
  const [cakeSizes, setCakeSizes] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [cakeSizeData, setCakeSizeData] = useState(null);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC")
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [keywords, setKeywords] = useState("");
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchCakeSizes = async () => {
    if (!token) return;
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords: keywords,
        sortOrder,
        sortField,
      };

      const response = await axios.get(getCakeSizesRoute, { params });
      setCakeSizes(response.data.data);
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
          fetchCakeSizes();
        }, 500);
        return () => clearTimeout(delay);
      } else {
        fetchCakeSizes();
      }
  }, [currentPage, pageLimit, keywords, sortOrder, sortField, token]);

  const showOffcanvasOnAddCakesSize = () => {
    setCakeSizeData(null);
    setShowOffcanvas(true);
  }

  const showOffcanvasOnEditCakesSize = (cakeSize) => {
    setCakeSizeData(cakeSize);
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

  const handleDelete = async (cakeSizeId) => {
    try {
      const response = await axios.delete(deleteCakeSizeByIdRoute(cakeSizeId));
      if(response.status === 200) {
        toast.success("Cake size deleted successfully!", {autoClose: 1000});
        setCakeSizes((prev) =>
          prev.filter((cakeSize) => cakeSize.id !== cakeSizeId)
        );
      }
    }catch (error){
      console.error("Error deleting Cake size:", error);
      toast.error("Failed to delete Cake size.");
    }
  }

  const showDeleteConfirmation = async (cakeSizeId) => {
    const confirmed = await confirmDialog({ message: "Are you sure you want to delete this Cake size?" });
    if(confirmed){
      handleDelete(cakeSizeId)
    }
  }

  const addCakeSize = (newCakeSize) => {
    setCakeSizes(prev => [newCakeSize, ...prev]);
    setShowOffcanvas(false);
  };

  const updateCakeSize = (updatedCakeSize) => {
    setCakeSizes((prev) =>
      prev.map((cakeSize) =>
        cakeSize.id === updatedCakeSize.id ? { ...cakeSize, ...updatedCakeSize } : cakeSize
      )
    );
    setShowOffcanvas(false);
  };

  const handleSortChange = (field) =>
    Common.handleSortingChange(field, setSortField, setSortOrder);

  const handleStatusToggle = async (cakeSize, checked) => {
    const nextStatus = checked ? "active" : "inactive";
    const previous = cakeSize.status;
    setCakeSizes((prev) =>
      prev.map((row) =>
        row.id === cakeSize.id ? { ...row, status: nextStatus } : row,
      ),
    );
    try {
      const fd = new FormData();
      fd.append("status", nextStatus);
      await axios.put(updateCakeSizeByIdRoute(cakeSize.id), fd);
    } catch (error) {
      setCakeSizes((prev) =>
        prev.map((row) =>
          row.id === cakeSize.id ? { ...row, status: previous } : row,
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
      <div className='d-flex justify-content-between mb-4'>
        <p className="pagetitle mb-0 fnt-color">Cakes Sizes</p>
        <div >
          <div
            className='btn-orange text-white fs-16 text-center'
            onClick={showOffcanvasOnAddCakesSize}
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
                <thead className="">
                  <tr className=''>
                    <th className="fw-medium fs-14 fnt-color text-nowrap"
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
                      onClick={() => handleSortChange("scoop_size")}>
                      Scope
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "scoop_size" &&
                        (sortOrder === "asc" ? "↑" : "↓")) ||
                         "↑↓"}
                      </span>
                    </th>
                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("additional_price")}>
                      Additional Price
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "additional_price" &&
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
                  {cakeSizes.map((cakeSize, index) => (
                    <tr key={cakeSize?.id}>
                      <td className="fw-normal fs-14 fnt-color">
                        {cakeSize?.id}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {cakeSize?.name_en}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {cakeSize?.cakeCategory?.name_en}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {cakeSize?.scoop_size}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {cakeSize?.additional_price}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        <img
                          src={marbleUploadUrl(cakeSize.image_url)}
                          className="image-fluid rounded-5"
                        />
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        <StatusToggle
                          id={`status-${cakeSize.id}`}
                          showLabel={false}
                          checked={cakeSize?.status === "active"}
                          onChange={(checked) =>
                            handleStatusToggle(cakeSize, checked)
                          }
                          aria-label="Toggle status"
                        />
                      </td>
                      <td>
                        <div className='d-flex gap-1'>
                          <div className='action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2' onClick={() => showOffcanvasOnEditCakesSize(cakeSize)}>
                            <i className="bi bi-pencil-square text-primary"></i></div>
                          <div className='action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2' onClick={() => showDeleteConfirmation(cakeSize.id)}>
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
              {cakeSizeData ? "Update Cake Size" : "Add Cake Size"}
            </div>
          </Offcanvas.Title>
          </Offcanvas.Header>
          <hr  className="mt-0"/>
          <Offcanvas.Body>
            <AddCakeSize
              cakeSizeData={cakeSizeData}
              closePopup={closePopup}
              onAddCakeSize={addCakeSize}
              onUpdateCakeSize={updateCakeSize}
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
