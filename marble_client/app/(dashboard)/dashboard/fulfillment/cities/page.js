"use client";
import React, { useEffect, useState } from "react";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import Offcanvas from "react-bootstrap/Offcanvas";
import AddCity from "@/components/dashboard/fulfillment/AddCity";
import { getCitiesListRoute, deleteCityByIdRoute, updateCityByIdRoute } from "@/utils/apiRoutes";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import Pagination from "@/components/dashboard/shared/Pagination";
import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";
import Common from "@/utils/Common";

export default function CitiesPage() {
  const { token } = useAxiosConfig();
  const [cities, setCities] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [cityData, setCityData] = useState(null);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(25);
  const [keywords, setKeywords] = useState("");
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchCities = async () => {
    if (!token) return;
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        keywords,
        sortOrder,
        sortField,
      };
      const response = await axios.get(getCitiesListRoute, { params });
      setCities(response.data.data || []);
      setTotalEntries(response.data.pagination?.total || 0);
      setPageCount(response.data.pagination?.pageCount || 0);
    } catch (error) {
      console.error("Error fetching cities", error);
    }
  };

  useEffect(() => {
    if (keywords !== "") {
      if (keywords.trim() === "") return;
      const delay = setTimeout(() => {
        fetchCities();
      }, 500);
      return () => clearTimeout(delay);
    }
    fetchCities();
  }, [currentPage, pageLimit, keywords, sortOrder, sortField, token]);

  const showOffcanvasOnEdit = (city) => {
    setCityData(city);
    setShowOffcanvas(true);
  };

  const showOffcanvasOnAdd = () => {
    setCityData(null);
    setShowOffcanvas(true);
  };

  const closePopup = () => setShowOffcanvas(false);

  const handleLimitChange = (newLimit) => {
    setPageLimit(newLimit);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleDelete = async (cityId) => {
    try {
      const response = await axios.delete(deleteCityByIdRoute(cityId));
      if (response.status === 200) {
        toast.success("City deleted successfully!", { autoClose: 1000 });
        setCities((prev) => prev.filter((city) => city.id !== cityId));
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete city.",
      );
    }
  };

  const showDeleteConfirmation = (cityId) => {
    if (confirm("Are you sure you want to delete this city?")) {
      handleDelete(cityId);
    }
  };

  const addCity = (newCity) => {
    setCities((prev) => [newCity, ...prev]);
    setShowOffcanvas(false);
  };

  const updateCity = (updatedCity) => {
    setCities((prev) =>
      prev.map((item) => (item.id === updatedCity.id ? updatedCity : item)),
    );
    setShowOffcanvas(false);
  };

  const handleSortChange = (field) =>
    Common.handleSortingChange(field, setSortField, setSortOrder);

  const handleStatusToggle = async (city, checked) => {
    const nextStatus = checked ? "active" : "inactive";
    const previous = city.status || "active";
    setCities((prev) =>
      prev.map((c) =>
        c.id === city.id ? { ...c, status: nextStatus } : c,
      ),
    );
    try {
      await axios.put(updateCityByIdRoute(city.id), { status: nextStatus });
    } catch (error) {
      setCities((prev) =>
        prev.map((c) =>
          c.id === city.id ? { ...c, status: previous } : c,
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
            <p className="pagetitle mb-0 fnt-color">Cities</p>
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
                      onClick={() => handleSortChange("name_ar")}
                    >
                      Name AR
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "name_ar" &&
                          (sortOrder === "asc" ? "↑" : "↓")) ||
                          "↑↓"}
                      </span>
                    </th>
                    <th
                      className="fw-medium fs-14 fnt-color text-nowrap"
                      onClick={() => handleSortChange("status")}
                    >
                      Status
                      <span className="fs-10 text-secondary ms-1">
                        {(sortField === "status" &&
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
                  {cities.map((city) => (
                    <tr key={city.id}>
                      <td className="fw-normal fs-14 fnt-color">{city.id}</td>
                      <td className="fw-normal fs-14 fnt-color">
                        {city.name_en}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        {city.name_ar}
                      </td>
                      <td className="fw-normal fs-14 fnt-color">
                        <StatusToggle
                          id={`status-${city.id}`}
                          showLabel={false}
                          checked={(city.status || "active") === "active"}
                          onChange={(checked) =>
                            handleStatusToggle(city, checked)
                          }
                          aria-label="Toggle status"
                        />
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() => showOffcanvasOnEdit(city)}
                          >
                            <i className="bi bi-pencil-square text-primary"></i>
                          </button>
                          <button
                            className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                            onClick={() => showDeleteConfirmation(city.id)}
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
                  {cityData ? "Update City" : "Add City"}
                </div>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <hr className="mt-0" />
            <Offcanvas.Body>
              <AddCity
                closePopup={closePopup}
                cityData={cityData}
                onAddCity={addCity}
                onUpdateCity={updateCity}
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
