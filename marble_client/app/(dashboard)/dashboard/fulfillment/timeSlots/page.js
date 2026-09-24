"use client";
import React, { useEffect, useState } from "react";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import Offcanvas from "react-bootstrap/Offcanvas";
import AddTimeSlot from "@/components/dashboard/fulfillment/AddTimeSlot";
import {
  getTimeSlotsListRoute,
  deleteTimeSlotByIdRoute,
  updateTimeSlotByIdRoute,
} from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import Common from "@/utils/Common";

const PRODUCT_TYPE_LABELS = {
  ready_products: "Ready",
  custom_products: "Custom",
};

export default function TimeSlotsPage() {
  const { token } = useAxiosConfig();
  const [slots, setSlots] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [slotData, setSlotData] = useState(null);
  const [sortField, setSortField] = useState("start_time");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [keywords, setKeywords] = useState("");
  const [productType, setProductType] = useState("");
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchSlots = async () => {
    if (!token) return;
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords,
        sortOrder,
        sortField,
      };
      if (productType) params.product_type = productType;
      const response = await axios.get(getTimeSlotsListRoute, { params });
      setSlots(response.data.data || []);
      setTotalEntries(response.data.pagination?.total || 0);
      setPageCount(response.data.pagination?.pageCount || 0);
    } catch (error) {
      console.error("Error fetching time slots", error);
    }
  };

  useEffect(() => {
    if (keywords !== "") {
      if (keywords.trim() === "") return;
      const delay = setTimeout(() => {
        fetchSlots();
      }, 500);
      return () => clearTimeout(delay);
    }
    fetchSlots();
  }, [
    currentPage,
    pageLimit,
    keywords,
    sortOrder,
    sortField,
    productType,
    token,
  ]);

  const showOffcanvasOnEdit = (slot) => {
    setSlotData(slot);
    setShowOffcanvas(true);
  };

  const showOffcanvasOnAdd = () => {
    setSlotData(null);
    setShowOffcanvas(true);
  };

  const closePopup = () => setShowOffcanvas(false);

  const handleLimitChange = (newLimit) => {
    setPageLimit(newLimit);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleDelete = async (slotId) => {
    try {
      const response = await axios.delete(deleteTimeSlotByIdRoute(slotId));
      if (response.status === 200) {
        toast.success("Time slot deleted successfully!", { autoClose: 1000 });
        setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete time slot.",
      );
    }
  };

  const showDeleteConfirmation = (slotId) => {
    if (confirm("Are you sure you want to delete this time slot?")) {
      handleDelete(slotId);
    }
  };

  const addSlot = (newSlot) => {
    setSlots((prev) => [newSlot, ...prev]);
    setShowOffcanvas(false);
  };

  const updateSlot = (updatedSlot) => {
    setSlots((prev) =>
      prev.map((item) => (item.id === updatedSlot.id ? updatedSlot : item)),
    );
    setShowOffcanvas(false);
  };

  const handleSortChange = (field) =>
    Common.handleSortingChange(field, setSortField, setSortOrder);

  const handleStatusToggle = async (slot, checked) => {
    const previous = slot.is_active !== false;
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slot.id ? { ...s, is_active: checked } : s,
      ),
    );
    try {
      await axios.put(updateTimeSlotByIdRoute(slot.id), {
        is_active: checked,
      });
    } catch (error) {
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slot.id ? { ...s, is_active: previous } : s,
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
            <p className="pagetitle mb-0 fnt-color">Time Slots</p>
            <div>
              <div
                className="btn-orange text-white fs-16 text-center"
                role="button"
                onClick={showOffcanvasOnAdd}
              >
                <i className="bi bi-plus-circle ms-2"></i>
                <span className="ms-1">Create</span>
              </div>
            </div>
          </div>
          <div className="d-flex flex-column flex-md-row gap-2">
            <div className="d-flex flex-grow-1 position-relative">
              <i className="bi bi-search fs-5 px-3 py-2 text-secondary position-absolute"></i>
              <input
                type="text"
                className="form-control px-5 text-dark-custom dashboard-search-input"
                placeholder="Search here..."
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
            <select
              className="form-select text-secondary"
              style={{ maxWidth: 220 }}
              value={productType}
              onChange={(e) => {
                setProductType(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All product types</option>
              <option value="ready_products">Ready products</option>
              <option value="custom_products">Custom products</option>
            </select>
          </div>
        </div>
        <div className="px-0 pt-0 rounded-2 p-0 mt-3">
          <div className="table-responsive">
            <div className="data-table">
              <table className="table datatable-wrapper">
                <thead>
                  <tr>
                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("id")}
                    >
                      ID
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "id" &&
                          (sortOrder === "asc" ? "↑" : "↓")) ||
                          "↑↓"}
                      </span>
                    </th>
                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("name_en")}
                    >
                      Name EN
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "name_en" &&
                          (sortOrder === "asc" ? "↑" : "↓")) ||
                          "↑↓"}
                      </span>
                    </th>
                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("start_time")}
                    >
                      Start
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "start_time" &&
                          (sortOrder === "asc" ? "↑" : "↓")) ||
                          "↑↓"}
                      </span>
                    </th>
                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("end_time")}
                    >
                      End
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "end_time" &&
                          (sortOrder === "asc" ? "↑" : "↓")) ||
                          "↑↓"}
                      </span>
                    </th>
                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("product_type")}
                    >
                      Type
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "product_type" &&
                          (sortOrder === "asc" ? "↑" : "↓")) ||
                          "↑↓"}
                      </span>
                    </th>
                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("is_active")}
                    >
                      Active
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "is_active" &&
                          (sortOrder === "asc" ? "↑" : "↓")) ||
                          "↑↓"}
                      </span>
                    </th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot.id}>
                      <td className="fw-normal fs-14 fnt-color">{slot.id}</td>
                      <td className="fw-normal fs-14 fnt-color">
                        {slot.name_en}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {slot.start_time}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {slot.end_time}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {PRODUCT_TYPE_LABELS[slot.product_type] ||
                          slot.product_type}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        <StatusToggle
                          id={`status-${slot.id}`}
                          showLabel={false}
                          checked={slot.is_active !== false}
                          onChange={(checked) =>
                            handleStatusToggle(slot, checked)
                          }
                          aria-label="Toggle status"
                        />
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() => showOffcanvasOnEdit(slot)}
                          >
                            <i className="bi bi-pencil-square text-primary"></i>
                          </button>
                          <button
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() => showDeleteConfirmation(slot.id)}
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
                  {slotData ? "Update Time Slot" : "Add Time Slot"}
                </div>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <hr className="mt-0" />
            <Offcanvas.Body>
              <AddTimeSlot
                closePopup={closePopup}
                slotData={slotData}
                onAddSlot={addSlot}
                onUpdateSlot={updateSlot}
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
