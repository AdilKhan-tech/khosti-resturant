"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import usePersistentSidebar from "@/hooks/usePersistentSidebar";
import useRbacAccess from "@/hooks/useRbacAccess";
import {
  CUSTOMERS_PERMISSIONS,
  DASHBOARD_MENU,
  ORDERS_PERMISSIONS,
} from "@/utils/rbac/dashboardNav";

const PRODUCT_TAXONOMY = new Set([
  "category",
  "gender",
  "occasion",
  "tags",
]);

function dropdownKeyForPath(pathname) {
  if (!pathname) return null;
  if (pathname.startsWith("/dashboard/product")) return "Products";
  if (pathname.startsWith("/dashboard/cake")) return "Cakes";
  if (pathname.startsWith("/dashboard/icecream")) return "IceCream";
  if (pathname.startsWith("/dashboard/cookie")) return "Cookies";
  if (pathname.startsWith("/dashboard/fulfillment")) return "Fulfillment";
  if (pathname.startsWith("/dashboard/marketing")) return "Marketing";
  if (pathname.startsWith("/dashboard/customer-service")) return "CustomerService";
  if (pathname.startsWith("/dashboard/reports")) return "Reports";
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  return null;
}

function isAllProductsActive(pathname) {
  if (pathname === "/dashboard/product") return true;
  if (!pathname.startsWith("/dashboard/product/")) return false;
  const segment = pathname.slice("/dashboard/product/".length).split("/")[0];
  return Boolean(segment) && !PRODUCT_TAXONOMY.has(segment);
}

export default function Sidebar() {
  const pathname = usePathname();
  const { can, canAny, isLoading, isAccessPending } = useRbacAccess();
  const accessReady = !isLoading && !isAccessPending;
  const { isOpen, toggleSidebar, closeSidebar, shouldAnimate } =
    usePersistentSidebar();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const sidebarRef = useRef(null);
  const previousPathnameRef = useRef(pathname);
  const parentActive = (paths) => paths.some((p) => pathname.startsWith(p));

  const isCollapsed = !isOpen;

  const canSeeItem = (item, menu) => {
    if (!accessReady) return false;
    const required = item.permissions || menu.anyPermissions;
    if (!required?.length) return true;
    return canAny(required);
  };

  const visibleMenus = useMemo(() => {
    if (!accessReady) return [];
    return DASHBOARD_MENU.map((menu) => {
      if (menu.anyPermissions?.length && !canAny(menu.anyPermissions)) {
        return null;
      }
      const items = menu.items.filter((item) => canSeeItem(item, menu));
      if (!items.length) return null;
      return { ...menu, items };
    }).filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessReady, canAny]);

  const canSeeOrders = accessReady && canAny(ORDERS_PERMISSIONS);
  const canSeeCustomers = accessReady && canAny(CUSTOMERS_PERMISSIONS);

  const canSeeDashboard =
    accessReady && (can("core.dashboard.view") || canSeeOrders);

  const handleToggle = () => {
    toggleSidebar();
    setActiveDropdown(null);
  };

  useEffect(() => {
    setIsHydrated(true);
    setActiveDropdown(dropdownKeyForPath(pathname));
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("sidebar-open");
      document.body.classList.remove("sidebar-collapsed");
    } else {
      document.body.classList.add("sidebar-collapsed");
      document.body.classList.remove("sidebar-open");
    }
  }, [isOpen]);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) return;

    previousPathnameRef.current = pathname;
    if (typeof window === "undefined") return;

    const isMobileSidebar = window.matchMedia("(max-width: 991.98px)").matches;
    if (isMobileSidebar) {
      const frame = window.requestAnimationFrame(() => {
        setActiveDropdown(null);
        closeSidebar();
      });
      return () => window.cancelAnimationFrame(frame);
    }

    setActiveDropdown(dropdownKeyForPath(pathname));
  }, [closeSidebar, pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isCollapsed) return;
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCollapsed]);

  const isActive = (path) => pathname === path;
  const isSectionActive = (path) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const itemIsActive = (item) => {
    if (item.match === "allProducts") return isAllProductsActive(pathname);
    if (item.section) return isSectionActive(item.href);
    return isActive(item.href);
  };

  const sidebarClass = [
    "dashboard-sidebar",
    "position-fixed",
    "bg-white",
    shouldAnimate ? "sidebar-with-animation" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const renderExpandedItems = (items) =>
    items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={`d-flex align-items-center ${itemIsActive(item) ? "active" : ""}`}
      >
        <i className={`bi ${item.icon} me-2 fs-5`}></i>
        {item.label}
      </Link>
    ));

  const renderCollapsedItems = (menu) =>
    menu.items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className="dropdown-link d-flex align-items-center text-decoration-none"
        onClick={() => setActiveDropdown(null)}
      >
        <i className={`bi ${item.icon} me-2 fs-5`}></i>
        {item.label}
      </Link>
    ));

  const renderDropdown = (menu) => (
    <li key={menu.key} className="mb-1 position-relative">
      <button
        type="button"
        className={`dropdown-toggle ${parentActive(menu.roots) ? "active" : ""}`}
        onClick={() =>
          setActiveDropdown(activeDropdown === menu.key ? null : menu.key)
        }
        aria-expanded={activeDropdown === menu.key}
      >
        <i className={`bi ${menu.icon} fs-5`}></i>
        {!isCollapsed && (
          <>
            <span className="ms-2">{menu.label}</span>
            <i
              className={`bi bi-chevron-${activeDropdown === menu.key ? "up" : "down"} ms-auto`}
            ></i>
          </>
        )}
      </button>

      {isHydrated && !isCollapsed && activeDropdown === menu.key && (
        <div className="submenu position-relative mt-2 d-flex text-decoration-none flex-column align-items-stretch">
          {renderExpandedItems(menu.items)}
        </div>
      )}

      {isHydrated && isCollapsed && activeDropdown === menu.key && (
        <div className="collapse-dropdown bg-white rounded-4 p-3 position-fixed shadow-sm">
          <div className="dropdown-header fnt-color p-2 fw-semibold">
            {menu.label}
          </div>
          {renderCollapsedItems(menu)}
        </div>
      )}
    </li>
  );

  const productsMenu = visibleMenus.find((menu) => menu.key === "Products");
  const otherMenus = visibleMenus.filter((menu) => menu.key !== "Products");

  return (
    <>
      {isCollapsed && (
        <button
          type="button"
          onClick={handleToggle}
          className="sidebar-toggle-btn sidebar-expand-btn d-flex align-items-center justify-content-center position-fixed border rounded-3 bg-white shadow-sm"
          aria-label="Expand sidebar"
        >
          <i className="bi bi-list fs-4 d-lg-none" aria-hidden="true"></i>
          <i
            className="bi bi-layout-sidebar-inset-reverse fs-5 d-none d-lg-inline"
            aria-hidden="true"
          ></i>
        </button>
      )}

      <aside
        ref={sidebarRef}
        className={sidebarClass}
        aria-label="Dashboard navigation"
      >
        <div className="sidebar-header position-sticky d-flex align-items-center justify-content-between mt-0">
          <Link href="/dashboard" className="logo-link text-decoration-none">
            {isCollapsed ? (
              <div className="d-flex w-100 justify-content-center align-items-center py-2 rounded-3 text-dark">
                <i className="bi bi-grid text-orange fs-4" aria-hidden="true"></i>
              </div>
            ) : (
              <div className="d-flex text-dark gap-2 align-items-center fs-18 fw-semibold">
                <i className="bi bi-grid text-orange"></i>
                <span>Dashboard</span>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <button
              type="button"
              onClick={handleToggle}
              className="sidebar-collapse-btn btn btn-sm border-0 rounded-3 d-flex align-items-center justify-content-center"
              aria-label="Collapse sidebar"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          )}
        </div>

        <nav className="sidebar-nav px-2 pb-4">
          <ul className="list-unstyled m-0 p-0">
            {canSeeDashboard && (
              <li className="mb-1 position-relative">
                <Link
                  href="/dashboard"
                  className={`d-flex align-items-center ${isActive("/dashboard") ? "active" : ""}`}
                >
                  <i className="bi bi-speedometer2 text-center fs-5"></i>
                  {!isCollapsed && <span className="ms-2">Dashboard</span>}
                </Link>
              </li>
            )}

            {productsMenu ? renderDropdown(productsMenu) : null}

            {canSeeOrders && (
              <li className="mb-1">
                <Link
                  href="/dashboard/orders"
                  className={`d-flex align-items-center ${isSectionActive("/dashboard/orders") ? "active" : ""}`}
                >
                  <i className="bi bi-receipt fs-5"></i>
                  {!isCollapsed && <span className="ms-2">Orders</span>}
                </Link>
              </li>
            )}

            {canSeeCustomers && (
              <li className="mb-1">
                <Link
                  href="/dashboard/customers"
                  className={`d-flex align-items-center ${isSectionActive("/dashboard/customers") ? "active" : ""}`}
                >
                  <i className="bi bi-people fs-5"></i>
                  {!isCollapsed && <span className="ms-2">Customers</span>}
                </Link>
              </li>
            )}

            {otherMenus.map((menu) => renderDropdown(menu))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
