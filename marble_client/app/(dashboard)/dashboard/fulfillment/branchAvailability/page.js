"use client";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Offcanvas from "react-bootstrap/Offcanvas";
import { ToastContainer, toast } from "react-toastify";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import AddBranchAvailability from "@/components/dashboard/fulfillment/AddBranchAvailability";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import Common from "@/utils/Common";
import {
  deleteBranchAvailabilityByIdRoute,
  getBranchAvailabilityRoute,
  getCitiesListRoute,
  updateBranchAvailabilityByIdRoute,
} from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

const TYPE_LABELS = {
  ready_products: "Ready",
  custom_products: "Custom",
};

export default function BranchAvailabilityPage() {
  const { token } = useAxiosConfig();
  const [rules, setRules] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [cityId, setCityId] = useState("");
  const [productType, setProductType] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchRules = useCallback(async () => {
    if (!token) return;
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords,
        sortField,
        sortOrder,
      };
      if (cityId) params.city_id = cityId;
      if (productType) params.product_type = productType;
      const response = await axios.get(getBranchAvailabilityRoute, { params });
      setRules(response.data.data || []);
      setTotalEntries(response.data.pagination?.total || 0);
      setPageCount(response.data.pagination?.pageCount || 0);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load branch availability.",
      );
    }
  }, [
    token,
    currentPage,
    pageLimit,
    keywords,
    cityId,
    productType,
    sortField,
    sortOrder,
  ]);

  useEffect(() => {
    if (!token) return;
    axios
      .get(getCitiesListRoute, { params: { page: 1, limit: 500 } })
      .then((response) => setCities(response.data.data || []))
      .catch(() => toast.error("Failed to load cities."));
  }, [token]);

  useEffect(() => {
    if (keywords !== "" && keywords.trim() === "") return;
    const delay = setTimeout(fetchRules, keywords ? 500 : 0);
    return () => clearTimeout(delay);
  }, [keywords, fetchRules]);

  const openCreate = () => {
    setSelectedRule(null);
    setShowOffcanvas(true);
  };

  const openEdit = (rule) => {
    setSelectedRule(rule);
    setShowOffcanvas(true);
  };

  const handleSaved = () => {
    setShowOffcanvas(false);
    fetchRules();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this availability rule?")) {
      return;
    }
    try {
      await axios.delete(deleteBranchAvailabilityByIdRoute(id));
      toast.success("Branch availability deleted successfully!", {
        autoClose: 1000,
      });
      fetchRules();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete branch availability.",
      );
    }
  };

  const handleStatusToggle = async (rule, checked) => {
    const previous = rule.is_active;
    setRules((prev) =>
      prev.map((row) =>
        row.id === rule.id ? { ...row, is_active: checked } : row,
      ),
    );
    try {
      await axios.put(updateBranchAvailabilityByIdRoute(rule.id), {
        is_active: checked,
      });
    } catch (error) {
      setRules((prev) =>
        prev.map((row) =>
          row.id === rule.id ? { ...row, is_active: previous } : row,
        ),
      );
      toast.error(
        error?.response?.data?.message || "Failed to update status.",
      );
    }
  };

  const handleSortChange = (field) =>
    Common.handleSortingChange(field, setSortField, setSortOrder);

  return (
    <>
      <section className="mt-3">
        <div className="d-flex justify-content-between mb-3">
          <p className="pagetitle mb-0 fnt-color">Branch Availability</p>
          <div
            className="btn-orange text-white fs-16 text-center"
            role="button"
            onClick={openCreate}
          >
            <i className="bi bi-plus-circle ms-2"></i>
            <span className="ms-1">Create</span>
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row gap-2">
          <div className="d-flex flex-grow-1 position-relative">
            <i className="bi bi-search fs-5 px-3 py-2 text-secondary position-absolute"></i>
            <input
              type="text"
              className="form-control px-5 text-dark-custom dashboard-search-input"
              placeholder="Search city or branch..."
              onChange={(event) => {
                setKeywords(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="form-select text-secondary"
            style={{ maxWidth: 220 }}
            value={cityId}
            onChange={(event) => {
              setCityId(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name_en}
              </option>
            ))}
          </select>
          <select
            className="form-select text-secondary"
            style={{ maxWidth: 220 }}
            value={productType}
            onChange={(event) => {
              setProductType(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All product types</option>
            <option value="ready_products">Ready products</option>
            <option value="custom_products">Custom products</option>
          </select>
        </div>

        <div className="px-0 pt-0 rounded-2 p-0 mt-3">
          <div className="table-responsive">
            <div className="data-table">
              <table className="table datatable-wrapper">
                <thead>
                  <tr>
                    {[
                      ["id", "ID"],
                      ["city", "City"],
                      ["product_type", "Type"],
                      ["slot_date", "Date"],
                      [null, "Branches"],
                      [null, "Pickup"],
                      [null, "Delivery"],
                      ["is_active", "Active"],
                    ].map(([field, label]) => (
                      <th
                        key={label}
                        className="fw-medium fs-14 fnt-color text-nowrap"
                        onClick={
                          field ? () => handleSortChange(field) : undefined
                        }
                      >
                        {label}
                        {field && (
                          <span className="fs-10 text-secondary ms-1">
                            {(sortField === field &&
                              (sortOrder.toLowerCase() === "asc"
                                ? "↑"
                                : "↓")) ||
                              "↑↓"}
                          </span>
                        )}
                      </th>
                    ))}
                    <th className="fw-medium fs-14 fnt-color text-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="fw-normal fs-14 fnt-color">{rule.id}</td>
                      <td className="fw-normal fs-14 fnt-color">
                        {rule.city?.name_en}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {TYPE_LABELS[rule.product_type] || rule.product_type}
                      </td>
                      <td className="fw-normal fs-14 fnt-color text-nowrap">
                        {rule.slot_date || "Default"}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {rule.branches?.map((branch) => branch.name_en).join(", ")}
                      </td>
                      <td className="fw-normal fs-14 fnt-color text-nowrap">
                        {rule.pickup_enabled
                          ? `${rule.pickup_slot_ids?.length || 0} slots`
                          : "Disabled"}
                      </td>
                      <td className="fw-normal fs-14 fnt-color text-nowrap">
                        {rule.delivery_enabled
                          ? `${rule.delivery_slot_ids?.length || 0} slots`
                          : "Disabled"}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        <StatusToggle
                          id={`availability-active-${rule.id}`}
                          showLabel={false}
                          checked={rule.is_active !== false}
                          onChange={(checked) =>
                            handleStatusToggle(rule, checked)
                          }
                          aria-label="Toggle rule active"
                        />
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() => openEdit(rule)}
                          >
                            <i className="bi bi-pencil-square text-primary"></i>
                          </button>
                          <button
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() => handleDelete(rule.id)}
                          >
                            <i className="bi bi-trash text-danger"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!rules.length && (
                    <tr>
                      <td colSpan="9" className="text-center text-muted py-4">
                        No availability rules found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mt-0">
        <Pagination
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={setCurrentPage}
          pageLimit={pageLimit}
          totalEntries={totalEntries}
        />
        <EntriesPerPageSelector
          pageLimit={pageLimit}
          onPageLimitChange={(limit) => {
            setPageLimit(limit);
            setCurrentPage(1);
          }}
        />
      </div>

      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        placement="end"
        style={{ width: "min(720px, 100vw)" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <div className="fs-24 fnt-color">
              {selectedRule
                ? "Update Branch Availability"
                : "Add Branch Availability"}
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <hr className="mt-0" />
        <Offcanvas.Body>
          <AddBranchAvailability
            closePopup={() => setShowOffcanvas(false)}
            availabilityData={selectedRule}
            onSaved={handleSaved}
          />
        </Offcanvas.Body>
      </Offcanvas>
      <ToastContainer />
    </>
  );
}
