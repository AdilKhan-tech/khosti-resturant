"use client";

import React, { useState, useEffect } from "react";
import AddBanner from "@/components/dashboard/marketing/AddBanner";
import { getBannersRoute, deleteBannerByIdRoute, updateBannerByIdRoute } from "@/utils/apiRoutes";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import Offcanvas from "react-bootstrap/Offcanvas";
import { ToastContainer, toast } from "react-toastify";
import { confirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import axios from "axios";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";

function BannersPage() {
  const { token } = useAxiosConfig();
  const [banners, setBanners] = useState([]);
  const [bannerData, setBannerData] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const fetchBanners = async () => {
    if (!token) return;
    try {
      const response = await axios.get(getBannersRoute);
      setBanners(response.data.data || []);
    } catch (error) {
      console.error("Error fetching banners", error);
      toast.error(
        error?.response?.data?.message || "Failed to load banners."
      );
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [token]);

  const openCreate = () => {
    setBannerData(null);
    setShowOffcanvas(true);
  };

  const openEdit = (banner) => {
    setBannerData(banner);
    setShowOffcanvas(true);
  };

  const closePopup = () => setShowOffcanvas(false);

  const handleDelete = async (id) => {
    try {
      await axios.delete(deleteBannerByIdRoute(id));
      toast.success("Banner deleted successfully!", { autoClose: 1000 });
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete banner."
      );
    }
  };

  const confirmDelete = async (id) => {
    if (
      await confirmDialog({ message: "Are you sure you want to delete this banner?" })
    ) {
      handleDelete(id);
    }
  };

  const isBannerActive = (banner) =>
    banner.status === 1 || banner.status === true || banner.status === "1";

  const handleStatusToggle = async (banner, nextActive) => {
    const previous = banner.status;
    const nextStatus = nextActive ? 1 : 0;
    setBanners((prev) =>
      prev.map((row) =>
        row.id === banner.id ? { ...row, status: nextStatus } : row,
      ),
    );
    try {
      const fd = new FormData();
      fd.append("slug", banner.slug || "");
      fd.append("status", nextActive ? "1" : "0");
      const res = await axios.put(updateBannerByIdRoute(banner.id), fd);
      const row = res.data?.data ?? res.data;
      if (row) {
        setBanners((prev) =>
          prev.map((b) => (b.id === banner.id ? { ...b, ...row } : b)),
        );
      }
    } catch (error) {
      setBanners((prev) =>
        prev.map((row) =>
          row.id === banner.id ? { ...row, status: previous } : row,
        ),
      );
      toast.error(
        error?.response?.data?.message || "Failed to update status.",
      );
    }
  };

  const addBanner = (row) => {
    setBanners((prev) => [...prev, row]);
    setShowOffcanvas(false);
  };

  const updateBanner = (row) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === row.id ? row : b))
    );
    setShowOffcanvas(false);
  };

  return (
    <>
      <section className="mt-3">
        <div className="">
          <div className="d-flex justify-content-between mb-3">
            <p className="pagetitle mb-0 fnt-color">Banners</p>
            <button
              type="button"
              className="btn-orange text-white fs-16"
              onClick={openCreate}
            >
              <i className="bi bi-plus-circle me-2"></i>Create
            </button>
          </div>
          <p className="text-secondary small mb-3">
            Manage banners: one slug per banner, with English and Arabic images.
          </p>
        </div>
        <div className="px-0 pt-0 rounded-2 p-0 mt-3">
          <div className="table-responsive">
            <div className="data-table">
              <table className="table datatable-wrapper">
                <thead>
                  <tr>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">ID</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Slug</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Banner (EN)</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Banner (AR)</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Status</th>
                    <th className="fw-medium fs-14 fnt-color text-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-secondary">
                        No banners found.
                      </td>
                    </tr>
                  ) : (
                    banners.map((banner) => (
                      <tr key={banner.id}>
                        <td className="fw-normal fs-14 fnt-color">{banner.id}</td>
                        <td className="fw-normal fs-14 fnt-color">
                          {banner.slug}
                        </td>
                        <td className="fw-normal fs-14 fnt-color">
                          {banner.banner_en_url ? (
                            <img
                              src={banner.banner_en_url}
                              alt="EN"
                              className="dashboard-img-max-100"
                            />
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td className="fw-normal fs-14 fnt-color">
                          {banner.banner_ar_url ? (
                            <img
                              src={banner.banner_ar_url}
                              alt="AR"
                              className="dashboard-img-max-100"
                            />
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td className="fw-normal fs-14 fnt-color">
                          <StatusToggle
                            id={`status-${banner.id}`}
                            showLabel={false}
                            checked={isBannerActive(banner)}
                            onChange={(checked) =>
                              handleStatusToggle(banner, checked)
                            }
                            aria-label="Toggle status"
                          />
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              type="button"
                              className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                              onClick={() => openEdit(banner)}
                            >
                              <i className="bi bi-pencil-square text-primary"></i>
                            </button>
                            <button
                              type="button"
                              className="action-btn d-flex justify-content-center align-items-center bg-transparent rounded-2"
                              onClick={() => confirmDelete(banner.id)}
                            >
                              <i className="bi bi-trash3 text-danger"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
                  {bannerData ? "Edit banner" : "Add banner"}
                </div>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <hr className="mt-0" />
            <Offcanvas.Body>
              <AddBanner
                closePopup={closePopup}
                bannerData={bannerData}
                onAddBanner={addBanner}
                onUpdateBanner={updateBanner}
              />
            </Offcanvas.Body>
          </Offcanvas>
          <ToastContainer />
        </div>
      </section>
    </>
  );
}

export default BannersPage;
