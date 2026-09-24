"use client";

import Dropdown from "react-bootstrap/Dropdown";
import { signOut, useSession } from "next-auth/react";

function Header() {
  const { data: session } = useSession();
  const displayName = session?.user?.full_name || "Admin";
  const phoneNumber = session?.user?.phone_number || "";

  return (
    <header
      id="header"
      className="header header-dashboard position-relative mb-0"
    >
      <div className="container-fluid dashboard-header-bar d-flex flex-nowrap align-items-center gap-2 gap-md-3">
        <div className="dashboard-header-welcome d-flex align-items-center gap-3 min-w-0">
          <img
            src="/assets/images/raisedhand.png"
            alt=""
            className="header-logo-rise object-fit-contain flex-shrink-0"
            width={24}
            height={24}
          />
          <span className="welcome-admin text-black fs-18 fw-medium mb-0 text-truncate">
            Welcome back, {displayName}!
          </span>
        </div>

        <div className="header-actions flex-shrink-0 ms-auto">
          <Dropdown align="end">
            <Dropdown.Toggle
              as="button"
              type="button"
              className="header-profile-toggle d-flex align-items-center gap-2 border-0 rounded-pill px-2 py-1 bg-transparent"
              id="dashboard-account-dropdown"
            >
              <span className="header-profile-avatar d-inline-flex align-items-center justify-content-center rounded-circle text-white">
                <i className="bi bi-person-fill" aria-hidden="true"></i>
              </span>
              <span className="d-none d-md-inline text-start lh-sm pe-1">
                <span className="d-block fw-semibold text-dark small text-truncate header-profile-name">
                  {displayName}
                </span>
                {phoneNumber ? (
                  <span className="d-block text-muted small text-truncate header-profile-name">
                    {phoneNumber}
                  </span>
                ) : null}
              </span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="dashboard-profile-menu shadow border-0 rounded-3 py-0 overflow-hidden">
              <div className="d-flex align-items-center gap-3 px-3 py-3">
                <span className="header-profile-avatar header-profile-avatar-lg d-inline-flex align-items-center justify-content-center rounded-circle text-white flex-shrink-0">
                  <i className="bi bi-person-fill" aria-hidden="true"></i>
                </span>
                <div className="min-w-0">
                  <div className="fw-semibold text-dark text-truncate">
                    {displayName}
                  </div>
                  {phoneNumber ? (
                    <div className="small text-muted text-truncate">
                      {phoneNumber}
                    </div>
                  ) : (
                    <div className="small text-muted">Signed in</div>
                  )}
                </div>
              </div>
              <Dropdown.Divider className="my-0" />
              <Dropdown.Item
                as="button"
                className="d-flex align-items-center gap-2 px-3 py-3 text-danger"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}

export default Header;
