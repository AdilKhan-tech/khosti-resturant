export const ORDERS_PERMISSIONS = [
  "orders.view",
  "orders.manage",
  "orders.branch_scope.view",
  "orders.print",
];

export const CUSTOMERS_PERMISSIONS = ["customers.view", "customers.manage"];

export const DASHBOARD_HOME_PERMISSIONS = [
  "core.dashboard.view",
  ...ORDERS_PERMISSIONS,
];

export const DASHBOARD_MENU = [
  {
    key: "Products",
    label: "Products",
    icon: "bi-box-seam",
    roots: ["/dashboard/product"],
    anyPermissions: [
      "catalog.products.view",
      "catalog.products.manage",
      "catalog.categories.manage",
      "catalog.tags.manage",
    ],
    items: [
      {
        href: "/dashboard/product",
        label: "All Products",
        icon: "bi-box-seam",
        match: "allProducts",
        permissions: ["catalog.products.view", "catalog.products.manage"],
      },
      {
        href: "/dashboard/product/category",
        label: "Categories",
        icon: "bi-tags-fill",
        permissions: ["catalog.categories.manage", "catalog.products.manage"],
      },
      {
        href: "/dashboard/product/gender",
        label: "Gender",
        icon: "bi-gender-ambiguous",
        permissions: ["catalog.categories.manage", "catalog.products.manage"],
      },
      {
        href: "/dashboard/product/occasion",
        label: "Occasions",
        icon: "bi-calendar-event-fill",
        permissions: ["catalog.categories.manage", "catalog.products.manage"],
      },
      {
        href: "/dashboard/product/tags",
        label: "Product Tags",
        icon: "bi-bookmarks-fill",
        permissions: ["catalog.tags.manage", "catalog.products.manage"],
      },
    ],
  },
  {
    key: "Cakes",
    label: "Cakes",
    icon: "bi-cake2",
    roots: ["/dashboard/cake"],
    anyPermissions: ["catalog.cakes.manage", "catalog.products.manage"],
    items: [
      { href: "/dashboard/cake/cakeSize", label: "Cake Sizes", icon: "bi-box-seam" },
      { href: "/dashboard/cake/cakeFlavor", label: "Cake Flavors", icon: "bi-heart" },
      {
        href: "/dashboard/cake/customCakeSize",
        label: "Custom Cake Sizes",
        icon: "bi-pencil-square",
      },
      {
        href: "/dashboard/cake/customCakeFlavor",
        label: "Custom Cake Flavors",
        icon: "bi-stars",
      },
      {
        href: "/dashboard/cake/customCakeType",
        label: "Custom Cake Types",
        icon: "bi-list-ul",
      },
      {
        href: "/dashboard/cake/cakePortionSize",
        label: "Cake Portion Sizes",
        icon: "bi-stopwatch",
      },
    ],
  },
  {
    key: "IceCream",
    label: "Ice Creams",
    icon: "bi-cone",
    roots: ["/dashboard/icecream"],
    anyPermissions: ["catalog.icecreams.manage", "catalog.products.manage"],
    items: [
      {
        href: "/dashboard/icecream/iceCreamAddon",
        label: "Ice Cream Add-Ons",
        icon: "bi-plus-circle",
      },
      {
        href: "/dashboard/icecream/iceCreamBucket",
        label: "Ice Cream Buckets",
        icon: "bi-bucket",
      },
      {
        href: "/dashboard/icecream/iceCreamPortionSize",
        label: "Ice Cream Portion Sizes",
        icon: "bi-stopwatch",
      },
    ],
  },
  {
    key: "Cookies",
    label: "Cookies",
    icon: "bi-cookie",
    roots: ["/dashboard/cookie"],
    anyPermissions: ["catalog.cookies.manage", "catalog.products.manage"],
    items: [
      { href: "/dashboard/cookie/boxSize", label: "Cookie Box Sizes", icon: "bi-box" },
      { href: "/dashboard/cookie/boxType", label: "Cookie Box Types", icon: "bi-list-ul" },
      { href: "/dashboard/cookie", label: "Cookies", icon: "bi-gift" },
    ],
  },
  {
    key: "Fulfillment",
    label: "Fulfillment",
    icon: "bi-truck",
    roots: ["/dashboard/fulfillment"],
    anyPermissions: ["settings.branches.manage", "settings.system.manage"],
    items: [
      {
        href: "/dashboard/fulfillment/branches",
        label: "Branches",
        icon: "bi-building-fill",
      },
      {
        href: "/dashboard/fulfillment/cities",
        label: "Cities",
        icon: "bi-geo-alt-fill",
      },
      {
        href: "/dashboard/fulfillment/timeSlots",
        label: "Time Slots",
        icon: "bi-clock-fill",
      },
      {
        href: "/dashboard/fulfillment/branchAvailability",
        label: "Branch Availability",
        icon: "bi-calendar-check-fill",
      },
      {
        href: "/dashboard/fulfillment/pickup-delivery",
        label: "Pickup & Delivery",
        icon: "bi-truck",
      },
      {
        href: "/dashboard/fulfillment/shipping",
        label: "Shipping Charges",
        icon: "bi-cash-coin",
      },
    ],
  },
  {
    key: "Marketing",
    label: "Marketing",
    icon: "bi-megaphone",
    roots: ["/dashboard/marketing"],
    anyPermissions: [
      "catalog.banners.manage",
      "marketing.coupons.manage",
      "marketing.promotions.manage",
      "marketing.seo.manage",
      "marketing.faqs.manage",
      "marketing.qr_codes.manage",
      "settings.system.manage",
    ],
    items: [
      {
        href: "/dashboard/marketing/coupons",
        label: "Coupons",
        icon: "bi-ticket-perforated",
        permissions: ["marketing.coupons.manage", "settings.system.manage"],
      },
      {
        href: "/dashboard/marketing/promotions",
        label: "Promotions",
        icon: "bi-percent",
        permissions: ["marketing.promotions.manage", "settings.system.manage"],
      },
      {
        href: "/dashboard/marketing/banners",
        label: "Banners",
        icon: "bi-image",
        permissions: ["catalog.banners.manage", "settings.system.manage"],
      },
      {
        href: "/dashboard/marketing/page-seo",
        label: "Page SEO",
        icon: "bi-search",
        permissions: ["marketing.seo.manage", "settings.system.manage"],
      },
      {
        href: "/dashboard/marketing/faqs",
        label: "FAQs",
        icon: "bi-question-circle",
        permissions: ["marketing.faqs.manage", "settings.system.manage"],
      },
      {
        href: "/dashboard/marketing/qr-codes",
        label: "QR Codes",
        icon: "bi-qr-code",
        section: true,
        permissions: ["marketing.qr_codes.manage", "settings.system.manage"],
      },
    ],
  },
  {
    key: "CustomerService",
    label: "Customer Service",
    icon: "bi-headset",
    roots: ["/dashboard/customer-service"],
    anyPermissions: [
      "feedback.view",
      "feedback.manage",
      "feedback.create",
      "feedback.complaint.view",
      "feedback.qa.view",
      "feedback.van.view",
      "feedback.marketing.view",
      "feedback.order.view",
      "feedback.qr.manage",
      "feedback.reports.view",
    ],
    items: [
      {
        href: "/dashboard/customer-service",
        label: "Tickets",
        icon: "bi-ticket-detailed",
        permissions: [
          "feedback.view",
          "feedback.manage",
          "feedback.complaint.view",
          "feedback.qa.view",
          "feedback.van.view",
          "feedback.marketing.view",
          "feedback.order.view",
        ],
      },
      {
        href: "/dashboard/customer-service/feedback-qrs",
        label: "Feedback QRs",
        icon: "bi-qr-code",
        permissions: ["feedback.qr.manage", "feedback.manage"],
      },
      {
        href: "/dashboard/customer-service/subjects",
        label: "Subjects",
        icon: "bi-bookmark",
        permissions: ["feedback.manage"],
      },
      {
        href: "/dashboard/customer-service/tags",
        label: "Tags",
        icon: "bi-tags",
        permissions: ["feedback.manage"],
      },
      {
        href: "/dashboard/customer-service/our-designs",
        label: "Our Designs",
        icon: "bi-images",
        permissions: ["feedback.manage", "feedback.view"],
      },
      {
        href: "/dashboard/customer-service/whatsapp",
        label: "WhatsApp Settings",
        icon: "bi-whatsapp",
        section: true,
        permissions: ["feedback.manage", "settings.system.manage"],
      },
    ],
  },
  {
    key: "Reports",
    label: "Reports",
    icon: "bi-bar-chart-line",
    roots: ["/dashboard/reports"],
    anyPermissions: [
      "reports.view",
      "reports.export",
      "feedback.reports.view",
      "feedback.manage",
      "marketing.qr_codes.manage",
    ],
    items: [
      {
        href: "/dashboard/reports/branch",
        label: "Branch Reports",
        icon: "bi-building",
        permissions: ["reports.view"],
      },
      {
        href: "/dashboard/reports/products-by-branch",
        label: "Products by Branch",
        icon: "bi-grid-3x3-gap",
        permissions: ["reports.view"],
      },
      {
        href: "/dashboard/reports/graduation",
        label: "Graduation Campaign",
        icon: "bi-mortarboard",
        permissions: ["reports.view"],
      },
      {
        href: "/dashboard/reports/customer-service",
        label: "Customer Service",
        icon: "bi-headset",
        permissions: [
          "feedback.reports.view",
          "feedback.manage",
          "reports.view",
        ],
      },
      {
        href: "/dashboard/reports/qr-attribution",
        label: "QR Attribution",
        icon: "bi-qr-code",
        permissions: ["reports.view", "marketing.qr_codes.manage"],
      },
    ],
  },
  {
    key: "Settings",
    label: "Settings",
    icon: "bi-gear",
    roots: ["/dashboard/settings"],
    anyPermissions: [
      "settings.access_control.view",
      "settings.access_control.manage",
      "settings.storefront.manage",
      "settings.system.manage",
      "core.notifications.view",
    ],
    items: [
      {
        href: "/dashboard/settings/storefront",
        label: "Storefront",
        icon: "bi-shop",
        section: true,
        permissions: ["settings.storefront.manage", "settings.system.manage"],
      },
      {
        href: "/dashboard/settings/access-control",
        label: "Access Control",
        icon: "bi-shield-lock",
        section: true,
        permissions: [
          "settings.access_control.view",
          "settings.access_control.manage",
        ],
      },
      {
        href: "/dashboard/settings/order-notifications",
        label: "Order Notifications",
        icon: "bi-bell",
        section: true,
        permissions: ["core.notifications.view", "settings.system.manage"],
      },
    ],
  },
];

const EXTRA_ROUTE_PERMISSIONS = [
  {
    prefix: "/dashboard/orders",
    permissions: ORDERS_PERMISSIONS,
  },
  {
    prefix: "/dashboard/customers",
    permissions: CUSTOMERS_PERMISSIONS,
  },
  {
    prefix: "/dashboard/product/add",
    permissions: ["catalog.products.view", "catalog.products.manage"],
  },
  {
    prefix: "/dashboard/marketing/qr-codes/report",
    permissions: ["reports.view", "marketing.qr_codes.manage"],
  },
];

function buildRoutePermissionEntries() {
  const entries = [...EXTRA_ROUTE_PERMISSIONS];

  for (const menu of DASHBOARD_MENU) {
    for (const item of menu.items) {
      entries.push({
        prefix: item.href,
        permissions: item.permissions || menu.anyPermissions || [],
      });
    }
  }

  return entries.sort((a, b) => b.prefix.length - a.prefix.length);
}

const ROUTE_PERMISSION_ENTRIES = buildRoutePermissionEntries();

/**
 * Returns permission keys required for a dashboard path, or null if the path
 * is not permission-gated (unknown/public dashboard shell routes).
 */
export function getRequiredPermissionsForPath(pathname) {
  if (!pathname || !pathname.startsWith("/dashboard")) return null;

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return DASHBOARD_HOME_PERMISSIONS;
  }

  for (const entry of ROUTE_PERMISSION_ENTRIES) {
    if (
      pathname === entry.prefix ||
      pathname.startsWith(`${entry.prefix}/`)
    ) {
      return entry.permissions;
    }
  }

  // Nested product editor routes: /dashboard/product/:id/view|add
  if (/^\/dashboard\/product\/[^/]+\/(view|add)/.test(pathname)) {
    return ["catalog.products.view", "catalog.products.manage"];
  }

  return null;
}
