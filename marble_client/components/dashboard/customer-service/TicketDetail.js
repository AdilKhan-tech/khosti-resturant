"use client";

import React, { useEffect, useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { Offcanvas } from "react-bootstrap";
import {
  getCsWhatsappTemplatesRoute,
  getFeedbackByIdRoute,
  sendFeedbackWhatsappRoute,
  updateFeedbackStatusRoute,
} from "@/utils/apiRoutes";
import { toast } from "react-toastify";
import axios from "axios";

const STATUSES = ["New", "In-progress", "Resolved"];

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

/** HRM-style relative timestamps for comment replies. */
function formatRelativeTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffSeconds = Math.max(
    Math.floor((Date.now() - date.getTime()) / 1000),
    0,
  );
  const minutes = Math.floor(diffSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) {
    return date.toLocaleDateString("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  if (days > 0) return `${days} ${days === 1 ? "day" : "days"} ago`;
  if (hours > 0) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }
  return `${diffSeconds || 1} ${diffSeconds === 1 ? "second" : "seconds"} ago`;
}

function DetailField({ label, value }) {
  return (
    <div className="col-6 mb-3">
      <div className="fw-medium text-dark-custom fs-16">{value || "—"}</div>
      <div className="fw-normal text-secondary fs-14">{label}</div>
    </div>
  );
}

function statusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "resolved") return "green-status";
  if (s === "in-progress") return "blue-status";
  return "orange-status";
}

function TicketDetail({ ticketId, onUpdated }) {
  const [tabKey, setTabKey] = useState("ticket");
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("In-progress");
  const [comments, setComments] = useState("");
  const [agentName, setAgentName] = useState("");
  const [saving, setSaving] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [waTemplate, setWaTemplate] = useState("");
  const [waMessage, setWaMessage] = useState("");
  const [sendingWa, setSendingWa] = useState(false);

  const loadTicket = async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const res = await axios.get(getFeedbackByIdRoute(ticketId));
      const data = res.data?.data ?? res.data;
      setTicket(data);
      if (data?.latest_status) setStatus(data.latest_status);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load ticket.",
      );
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTabKey("ticket");
    loadTicket();
  }, [ticketId]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await axios.get(getCsWhatsappTemplatesRoute);
        setTemplates(res.data?.data || []);
      } catch {
        setTemplates([]);
      }
    };
    loadTemplates();
  }, []);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!comments.trim()) {
      toast.error("Comments are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        status,
        comments: comments.trim(),
      };
      if (agentName.trim()) payload.agent_name = agentName.trim();

      const res = await axios.post(
        updateFeedbackStatusRoute(ticketId),
        payload,
      );
      const data = res.data?.data ?? res.data;
      setTicket(data);
      setComments("");
      toast.success("Status updated!", { autoClose: 1000 });
      onUpdated?.(data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.errors?.[0] ||
          "Failed to update status.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateChange = (value) => {
    setWaTemplate(value);
    if (value) setWaMessage(value);
  };

  const handleSendWhatsapp = async (e) => {
    e.preventDefault();
    if (!waMessage.trim()) {
      toast.error("Message is required.");
      return;
    }
    setSendingWa(true);
    try {
      await axios.post(sendFeedbackWhatsappRoute(ticketId), {
        message: waMessage.trim(),
      });
      toast.success("WhatsApp message sent!", { autoClose: 1500 });
      setWaMessage("");
      setWaTemplate("");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.errors?.[0] ||
          "Failed to send WhatsApp message.",
      );
    } finally {
      setSendingWa(false);
    }
  };

  const logs = Array.isArray(ticket?.logs) ? ticket.logs : [];

  return (
    <>
      <Offcanvas.Header closeButton className="border-bottom-0">
        <div className="mainTabs w-100">
          <Tabs activeKey={tabKey} onSelect={(k) => setTabKey(k)}>
            <Tab
              eventKey="ticket"
              title={
                <div>
                  <span className="fw-semibold fs-20">Ticket</span>
                </div>
              }
            />
            <Tab
              eventKey="comments"
              title={
                <div>
                  <span className="fw-semibold fs-20">Comments</span>
                  {logs.length > 0 ? (
                    <span className="fs-13 text-muted ms-2">{logs.length}</span>
                  ) : null}
                </div>
              }
            />
          </Tabs>
        </div>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column">
        <div
          className="flex-grow-1 overflow-auto mb-3"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,0,0,0.3) transparent",
          }}
        >
          {loading ? (
            <p className="text-secondary">Loading ticket…</p>
          ) : !ticket ? (
            <p className="text-secondary">Ticket not found.</p>
          ) : tabKey === "ticket" ? (
            <div>
              <div className="d-flex align-items-center mb-2 flex-wrap gap-2">
                <h5 className="mb-0 me-2 fs-18 text-dark-custom fw-semibold">
                  {ticket.review_type || "Ticket"}
                </h5>
                <span
                  className={`${statusBadgeClass(ticket.latest_status)} text-capitalize`}
                >
                  {ticket.latest_status || "New"}
                </span>
                <span className="text-secondary ms-auto fs-14 fw-medium">
                  ID# {ticket.id}
                </span>
              </div>
              <hr />

              <div className="row">
                <DetailField label="Customer" value={ticket.customer_name} />
                <DetailField label="Phone" value={ticket.customer_phone} />
                <DetailField label="City" value={ticket.city} />
                <DetailField label="Branch" value={ticket.branch} />
                <DetailField label="Source" value={ticket.source} />
                <DetailField label="Entry type" value={ticket.entry_type} />
                <DetailField label="Order number" value={ticket.order_number} />
                <DetailField label="Agent" value={ticket.agent_name} />
                <DetailField label="Rating" value={ticket.rating} />
                <DetailField
                  label="Subject / Tag"
                  value={
                    [ticket.subject_id, ticket.tag_id]
                      .filter(Boolean)
                      .join(" / ") || null
                  }
                />
                <DetailField
                  label="Created"
                  value={formatDate(ticket.created_at)}
                />
              </div>

              {ticket.attachment ? (
                <div className="mb-3">
                  <div className="fw-normal text-secondary fs-14 mb-1">
                    Attachment
                  </div>
                  <a href={ticket.attachment} target="_blank" rel="noreferrer">
                    <img
                      src={ticket.attachment}
                      alt="Ticket attachment"
                      style={{
                        maxWidth: 120,
                        maxHeight: 120,
                        objectFit: "cover",
                      }}
                      className="rounded border"
                    />
                  </a>
                </div>
              ) : null}

              <hr className="my-3" />
              <p className="fs-16 fw-medium fnt-color mb-2">WhatsApp</p>
              <form onSubmit={handleSendWhatsapp}>
                <div className="mb-3">
                  <label className="form-label">Template</label>
                  <select
                    className="form-select fs-14"
                    value={waTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                  >
                    <option value="">
                      Select Ready message Templates or Write your Own
                    </option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.content}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control fs-14"
                    rows={4}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={sendingWa}
                  className="form-submit-btn form-submit-btn-size d-inline-flex align-items-center justify-content-center gap-2 border-0 text-white fs-16 fw-medium rounded-3"
                >
                  <i className="bi bi-whatsapp" aria-hidden="true"></i> Send
                  WhatsApp
                </button>
              </form>
            </div>
          ) : (
            <div>
              <p className="fs-18 fnt-color fw-semibold mb-3">Add a Comment</p>
              <form onSubmit={handleStatusUpdate}>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select fs-14"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <textarea
                    className="form-control fs-14"
                    rows={4}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Write a comment…"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Agent name (optional)</label>
                  <input
                    type="text"
                    className="form-control fs-14"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="form-submit-btn form-submit-btn-size d-inline-flex align-items-center justify-content-center gap-2 border-0 text-white fs-16 fw-medium rounded-3"
                >
                  <i className="bi bi-send-fill" aria-hidden="true"></i> Post
                  comment
                </button>
              </form>

              <div className="mt-4 fs-18 fnt-color fw-semibold">
                {logs.length}
                <span className="ms-2">Comments</span>
              </div>

              <div className="mt-3">
                {logs.length === 0 ? (
                  <p className="text-secondary small">No comments yet.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="mb-3 pb-3 border-bottom">
                      <div className="d-flex align-items-center mb-1 flex-wrap gap-2">
                        <span className="fs-16 fw-semibold fnt-color">
                          {log.agent_name || "Agent"}
                        </span>
                        <span className="ms-2 fs-13 fw-light opacity-50">
                          {formatRelativeTime(log.created_at)}
                        </span>
                        <span
                          className={`${statusBadgeClass(log.status)} text-capitalize ms-2`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <p className="fs-14 fw-normal fnt-color mb-0">
                        {log.comments}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </Offcanvas.Body>
    </>
  );
}

export default TicketDetail;
