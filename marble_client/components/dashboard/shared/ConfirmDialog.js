"use client";

import { useCallback, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";

/**
 * Global, promise-based confirmation dialog.
 *
 * Usage (drop-in replacement for window.confirm):
 *   const ok = await confirmDialog({ message: "Delete this item?" });
 *   if (!ok) return;
 *
 * Mount <ConfirmDialog /> once near the app root (done in DashboardShell).
 */

const DEFAULTS = {
  title: "Confirm deletion",
  message:
    "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText: "Delete",
  cancelText: "Cancel",
  variant: "danger",
};

let openConfirm = null;

export function confirmDialog(options = {}) {
  if (typeof openConfirm === "function") {
    return openConfirm(options);
  }
  // Fallback when the host is not mounted (e.g. SSR).
  if (typeof window !== "undefined") {
    return Promise.resolve(window.confirm(options.message || DEFAULTS.message));
  }
  return Promise.resolve(false);
}

export default function ConfirmDialog() {
  const [state, setState] = useState({
    show: false,
    options: DEFAULTS,
    resolve: null,
  });

  useEffect(() => {
    openConfirm = (options) =>
      new Promise((resolve) => {
        setState({
          show: true,
          options: { ...DEFAULTS, ...options },
          resolve,
        });
      });
    return () => {
      openConfirm = null;
    };
  }, []);

  const close = useCallback((result) => {
    setState((prev) => {
      prev.resolve?.(result);
      return { ...prev, show: false, resolve: null };
    });
  }, []);

  const { show, options } = state;

  return (
    <Modal show={show} onHide={() => close(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-18 fw-semibold fnt-color">
          {options.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-secondary">{options.message}</Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          className="form-cancel-btn form-cancel-btn-size d-inline-flex align-items-center justify-content-center gap-2 bg-white border rounded-3 text-muted fs-14 px-4"
          onClick={() => close(false)}
        >
          <i className="bi bi-x-circle" aria-hidden="true"></i>
          {options.cancelText}
        </button>
        <button
          type="button"
          className={`btn btn-${options.variant} form-cancel-btn-size d-inline-flex align-items-center justify-content-center gap-2 rounded-3 text-white fs-14 px-4`}
          onClick={() => close(true)}
        >
          <i className="bi bi-trash" aria-hidden="true"></i>
          {options.confirmText}
        </button>
      </Modal.Footer>
    </Modal>
  );
}
