"use client";

import Link from "next/link";
import { useState } from "react";
import LoginModal from "@/components/frontend/LoginModal";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Menu" },
  { href: "/room-details", label: "Private Dining" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header>
        <div className="header-topbar text-white py-2">
          <div className="container d-flex justify-content-between align-items-center gap-3">
            <span>
              <i className="bi bi-geo-alt me-2"></i>15 Prince Road, London
            </span>
            <span>
              <i className="bi bi-telephone me-2"></i>+11 345 67890
            </span>
          </div>
        </div>

        <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top hotel-navbar">
          <div className="container">
            <Link
              href="/"
              className="navbar-brand d-flex align-items-center gap-3 text-decoration-none"
            >
              <span className="brand-mark">K</span>
              <div>
                <div className="brand-name">KHOSTI RESTAURANT</div>
                <small className="brand-sub">FINE DINING</small>
              </div>
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainNav"
              aria-controls="mainNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>

            <div className="collapse navbar-collapse" id="mainNav">
              <ul className="navbar-nav mx-auto align-items-center gap-lg-1">
                {navItems.map((item) => (
                  <li key={item.href} className="nav-item">
                    <Link href={item.href} className="nav-link text-dark px-3">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-dark px-3 py-2 fw-semibold login-trigger"
                  onClick={() => setLoginOpen(true)}
                >
                  <i className="bi bi-person me-2"></i>Login
                </button>
                <Link
                  href="/booking"
                  className="btn btn-primary px-4 py-2 fw-semibold"
                >
                  Reserve a Table <i className="bi bi-arrow-up-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <LoginModal show={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
