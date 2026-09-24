import { host } from "./apiHost"

export const loginRoute = `${host}/users/login`
export const adminLoginRoute = `${host}/users/admin/login`
export const registerRoute = `${host}/users/register`
export const sendOtpRoute = `${host}/users/otp/send`
export const verifyOtpRoute = `${host}/users/otp/verify`

// CakeSizes
export const getCakeSizesRoute = `${host}/cakes/sizes`
export const createCakeSizeRoute = `${host}/cakes/sizes`
export const deleteCakeSizeByIdRoute = (id) => `${host}/cakes/sizes/${id}`
export const updateCakeSizeByIdRoute = (id) => `${host}/cakes/sizes/${id}`

// CakeFlavors
export const getCakeFlavorsRoute = `${host}/cakes/flavors`
export const createCakeFlavorRoute = `${host}/cakes/flavors`
export const deleteCakeFlavorByIdRoute = (id) => `${host}/cakes/flavors/${id}`
export const updateCakeFlavorByIdRoute = (id) => `${host}/cakes/flavors/${id}`

// CustomCakeFlavors
export const getCustomCakeFlavorsRoute = `${host}/cakes/custom/flavors`
export const createCustomCakeFlavorRoute = `${host}/cakes/custom/flavors`
export const updateCustomCakeFlavorByIdRoute = (id) => `${host}/cakes/custom/flavors/${id}`
export const deleteCustomCakeFlavorByIdRoute = (id) => `${host}/cakes/custom/flavors/${id}`

// CustomCakeOptions (public - types with sizes & flavors)
export const getCustomCakeOptionsRoute = `${host}/cakes/custom/options`

// CustomCakeTypes
export const getCustomCakeTypesRoute = `${host}/cakes/custom/types`
export const createCustomCakeTypeRoute = `${host}/cakes/custom/types`
export const deleteCustomCakeTypeByIdRoute = (id) => `${host}/cakes/custom/types/${id}`
export const updateCustomCakeTypeByIdRoute = (id) => `${host}/cakes/custom/types/${id}`

// CakePortionSizes
export const getCakePortionSizesRoute = `${host}/cakes/portionSize`
export const createCakePortionSizeRoute = `${host}/cakes/portionSize`
export const updateCakePortionSizeByIdRoute = (id) => `${host}/cakes/portionSize/${id}`
export const deleteCakePortionSizeByIdRoute = (id) => `${host}/cakes/portionSize/${id}`
export const getCakePortionSizeTreeRoute = `${host}/cakes/portionSize/tree`

// IceCreamPortionSizes
export const getIceCreamPortionSizesRoute = `${host}/icecreams/portions`
export const createIceCreamPortionSizeRoute = `${host}/icecreams/portions`
export const deleteIceCreamPortionSizeByIdRoute = (id) => `${host}/icecreams/portions/${id}`
export const updateIceCreamPortionSizeByIdRoute = (id) => `${host}/icecreams/portions/${id}`
export const getIceCreamPortionSizeTreeRoute = `${host}/icecreams/portions/tree`

// IcecreamAddOns
export const getIcecreamAddOnsRoute = `${host}/icecreams/addons`
export const createIceCreamAddOnRoute = `${host}/icecreams/addons`
export const updateIceCreamAddOnByIdRoute = (id) => `${host}/icecreams/addons/${id}`
export const deleteIceCreamAddonByIdRoute = (id) => `${host}/icecreams/addons/${id}`

// IceCreamBuckets
export const getIceCreamBucketsRoute = `${host}/icecreams/buckets`
export const createIceCreamBucketRoute = `${host}/icecreams/buckets`
export const deleteIceCreamBucketByIdRoute = (id) => `${host}/icecreams/buckets/${id}`
export const updateIceCreamBucketByIdRoute = (id) => `${host}/icecreams/buckets/${id}`

// CustomIcecreamOptions (public - buckets with addons)
export const getCustomIcecreamOptionsRoute = `${host}/icecreams/custom/options`

// CustomCookieOptions (public - types with sizes & cookies)
export const getCustomCookieOptionsRoute = `${host}/cookies/custom/options`

// CookieBoxSizes
export const getCookieBoxSizesRoute = `${host}/cookies/sizes`
export const createCookieBoxSizeRoute = `${host}/cookies/sizes`
export const deleteCookieBoxSizeByIdRoute = (id) => `${host}/cookies/sizes/${id}`
export const updateCookieBoxSizeByIdRoute = (id) => `${host}/cookies/sizes/${id}`

// CookieBoxTypes
export const getCookieBoxTypesRoute = `${host}/cookies/types`
export const createCookieBoxTypeRoute = `${host}/cookies/types`
export const deleteCookieBoxTypeByIdRoute = (id) => `${host}/cookies/types/${id}`
export const updateCookieTypeByIdRoute = (id) => `${host}/cookies/types/${id}`

// Cookies
export const getCookiesRoute = `${host}/cookies`
export const createCookieRoute = `${host}/cookies`
export const deleteCookieByIdRoute = (id) => `${host}/cookies/${id}`
export const updateCookieByIdRoute = (id) => `${host}/cookies/${id}`

// Occasions
export const getOccasionsRoute = `${host}/occasions`
export const createOccasionRoute = `${host}/occasions`
export const updateOccasionByIdRoute = (id) => `${host}/occasions/${id}`
export const deleteOccasionByIdRoute = (id) => `${host}/occasions/${id}`

// Genders
export const getGendersRoute = `${host}/genders`
export const createGenderRoute = `${host}/genders`
export const deleteGenderByIdRoute = (id) => `${host}/genders/${id}`
export const updateGenderByIdRoute = (id) => `${host}/genders/${id}`

// Products
export const getProductsRoute = `${host}/products`
export const createProductRoute = `${host}/products`
export const getProductByIdRoute = (id) => `${host}/products/${id}`
export const getProductOptionsRoute = (id) => `${host}/products/${id}/options`
export const deleteProductByIdRoute = (id) => `${host}/products/${id}`
export const updateProductByIdRoute = (id) => `${host}/products/${id}`

// Cart
export const addCartItemRoute = `${host}/cart/add`
export const getCartByUserRoute = (userId) => `${host}/cart/products/${userId}`
export const updateCartItemRoute = `${host}/cart/update`
export const deleteCartItemRoute = `${host}/cart/delete`
export const emptyCartRoute = `${host}/cart/empty`
export const applyCartCouponRoute = `${host}/cart/coupon`
export const removeCartCouponRoute = `${host}/cart/coupon`

// Coupons (admin)
export const getCouponsRoute = `${host}/coupons`
export const createCouponRoute = `${host}/coupons`
export const updateCouponByIdRoute = (id) => `${host}/coupons/${id}`
export const deleteCouponByIdRoute = (id) => `${host}/coupons/${id}`

// Promotional Discounts
export const getPromotionsRoute = `${host}/promotions`
export const upsertPromotionRoute = `${host}/promotions`
export const updatePromotionByIdRoute = (id) => `${host}/promotions/${id}`
export const deletePromotionByIdRoute = (id) => `${host}/promotions/${id}`
export const selectCartFreeProductRoute = `${host}/cart/free-product`

// Orders
export const createOrderRoute = `${host}/orders`
export const createCustomCakeQuoteRoute = `${host}/orders/custom-cake-quote`
export const getOrdersRoute = `${host}/orders`
export const getCustomerOrdersRoute = (customerId) => `${host}/customers/${encodeURIComponent(customerId || "")}/orders`
export const getCustomersRoute = `${host}/customers`
export const getCustomerByIdRoute = (id) => `${host}/customers/${encodeURIComponent(id || "")}`
export const updateCustomerByIdRoute = (id) => `${host}/customers/${encodeURIComponent(id || "")}`
export const getOrderByNumberRoute = (orderNumber) => `${host}/orders/${encodeURIComponent(orderNumber || "")}`
export const printOrderPdfRoute = (orderNumber, size) =>
  `${host}/orders/${encodeURIComponent(orderNumber || "")}/print/${encodeURIComponent(size || "small")}`
export const getOrderStatusesRoute = `${host}/orders/statuses`
export const updateOrderStatusRoute = (orderNumber) => `${host}/orders/${encodeURIComponent(orderNumber || "")}/status`
export const sendOrderQuotationRoute = (orderNumber) => `${host}/orders/${encodeURIComponent(orderNumber || "")}/quotation`
export const respondOrderQuotationRoute = (orderNumber) => `${host}/orders/${encodeURIComponent(orderNumber || "")}/quotation-response`

// Payments (MyFatoorah)
export const initiatePaymentRoute = `${host}/payments/initiate`
export const getPaymentStatusRoute = (orderId) => `${host}/payments/status/${orderId}`

// Categories
export const getCategoriesRoute = `${host}/categories`
export const createCategoryRoute = `${host}/categories`
export const updateCategoryByIdRoute = (id) => `${host}/categories/${id}`
export const deleteCategoryByIdRoute = (id) => `${host}/categories/${id}`
export const getCategoryTreeRoute = `${host}/categories/tree`
export const getCategoryChildrenRoute = `${host}/categories/children`

// Branches
export const getBranchesRoute = `${host}/branches`
export const createBranchRoute = `${host}/branches`
export const deleteBranchByIdRoute = (id) => `${host}/branches/${id}`
export const updateBranchByIdRoute = (id) => `${host}/branches/${id}`

// Cities (table-backed; nested tree mirrors WP /cities)
export const getCitiesRoute = `${host}/cities`
export const getCitiesListRoute = `${host}/cities/list`
export const createCityRoute = `${host}/cities`
export const updateCityByIdRoute = (id) => `${host}/cities/${id}`
export const deleteCityByIdRoute = (id) => `${host}/cities/${id}`

// Time slots
export const getTimeSlotsRoute = `${host}/time-slots`
export const getTimeSlotsListRoute = `${host}/time-slots/list`
export const createTimeSlotRoute = `${host}/time-slots`
export const updateTimeSlotByIdRoute = (id) => `${host}/time-slots/${id}`
export const deleteTimeSlotByIdRoute = (id) => `${host}/time-slots/${id}`

// Branch availability
export const getBranchAvailabilityRoute = `${host}/branch-availability`
export const createBranchAvailabilityRoute = `${host}/branch-availability`
export const updateBranchAvailabilityByIdRoute = (id) => `${host}/branch-availability/${id}`
export const deleteBranchAvailabilityByIdRoute = (id) => `${host}/branch-availability/${id}`

// Storefront-wide Delivery / Pickup switches
export const getPickupDeliverySettingsRoute = `${host}/pickup-delivery-settings`
export const updatePickupDeliverySettingsRoute = `${host}/pickup-delivery-settings`

// Delivery fee rules (free threshold, distance formula, flat fees)
export const getShippingSettingsRoute = `${host}/shipping-settings`
export const updateShippingSettingsRoute = `${host}/shipping-settings`

export const getOrderNotificationSettingsRoute = `${host}/order-notification-settings`
export const updateOrderNotificationSettingsRoute = `${host}/order-notification-settings`
export const getStorefrontSettingsRoute = `${host}/storefront-settings`
export const updateStorefrontSettingsRoute = `${host}/storefront-settings`
export const getStorefrontPublicRoute = `${host}/storefront-settings/public`

// CustomCakeSizes
export const getCustomCakeSizesRoute = `${host}/cakes/custom/sizes`
export const createCustomCakeSizeRoute = `${host}/cakes/custom/sizes`
export const deleteCustomCakeSizeByIdRoute = (id) => `${host}/cakes/custom/sizes/${id}`
export const updateCustomCakeSizeByIdRoute = (id) => `${host}/cakes/custom/sizes/${id}`

// ProductTags
export const getTagsRoute = `${host}/tags`
export const createTagRoute = `${host}/tags`
export const deleteTagByIdRoute = (id) => `${host}/tags/${id}`
export const updateTagByIdRoute = (id) => `${host}/tags/${id}`

// Banners
export const getBannersRoute = `${host}/banners`
export const getBannerBySlugRoute = (slug) => `${host}/banners/public/${slug}`
export const createBannerRoute = `${host}/banners`
export const updateBannerByIdRoute = (id) => `${host}/banners/${id}`
export const deleteBannerByIdRoute = (id) => `${host}/banners/${id}`

// Page SEO (titles / descriptions / keywords)
export const getPageSeoRoute = `${host}/page-seo`
export const getPageSeoBySlugRoute = (slug) => `${host}/page-seo/public/${slug}`
export const createPageSeoRoute = `${host}/page-seo`
export const updatePageSeoByIdRoute = (id) => `${host}/page-seo/${id}`
export const deletePageSeoByIdRoute = (id) => `${host}/page-seo/${id}`

// FAQs (EN/AR Q&A)
export const getFaqsRoute = `${host}/faqs`
export const getFaqsPublicRoute = `${host}/faqs/public`
export const createFaqRoute = `${host}/faqs`
export const updateFaqByIdRoute = (id) => `${host}/faqs/${id}`
export const deleteFaqByIdRoute = (id) => `${host}/faqs/${id}`

// QR codes (brand/location landing)
export const getQrCodesRoute = `${host}/qr-codes`
export const getQrCodeParentsRoute = `${host}/qr-codes/parents`
export const getQrCodeBySkuRoute = (sku) =>
  `${host}/qr-codes/public/${encodeURIComponent(sku)}`
export const getQrOrderReportRoute = `${host}/qr-codes/order-report`
export const createQrCodeRoute = `${host}/qr-codes`
export const updateQrCodeByIdRoute = (id) => `${host}/qr-codes/${id}`
export const deleteQrCodeByIdRoute = (id) => `${host}/qr-codes/${id}`

// Customer Service (feedback tickets, subjects/tags, feedback QRs)
export const getFeedbacksRoute = `${host}/customer-service/feedbacks`
export const exportFeedbacksRoute = `${host}/customer-service/feedbacks/export`
export const getFeedbackFilterOptionsRoute = `${host}/customer-service/feedbacks/filter-options`
export const getFeedbackByIdRoute = (id) => `${host}/customer-service/feedbacks/${id}`
export const createFeedbackRoute = `${host}/customer-service/feedbacks`
export const updateFeedbackStatusRoute = (id) =>
  `${host}/customer-service/feedbacks/${id}/status`
export const sendFeedbackWhatsappRoute = (id) =>
  `${host}/customer-service/feedbacks/${id}/whatsapp`
export const createFeedbackOrderLinkRoute = `${host}/customer-service/feedbacks/order-link`
export const getCsWhatsappTemplatesRoute = `${host}/customer-service/whatsapp-templates`

export const getCsSubjectsRoute = `${host}/customer-service/subjects`
export const createCsSubjectRoute = `${host}/customer-service/subjects`
export const updateCsSubjectByIdRoute = (id) => `${host}/customer-service/subjects/${id}`
export const deleteCsSubjectByIdRoute = (id) => `${host}/customer-service/subjects/${id}`

export const getCsTagsRoute = `${host}/customer-service/tags`
export const createCsTagRoute = `${host}/customer-service/tags`
export const updateCsTagByIdRoute = (id) => `${host}/customer-service/tags/${id}`
export const deleteCsTagByIdRoute = (id) => `${host}/customer-service/tags/${id}`

export const getFeedbackQrsRoute = `${host}/customer-service/feedback-qrs`
export const createFeedbackQrRoute = `${host}/customer-service/feedback-qrs`
export const updateFeedbackQrByIdRoute = (id) =>
  `${host}/customer-service/feedback-qrs/${id}`
export const deleteFeedbackQrByIdRoute = (id) =>
  `${host}/customer-service/feedback-qrs/${id}`

export const getCsWhatsappSettingsRoute = `${host}/customer-service/whatsapp-settings`
export const updateCsWhatsappSettingsRoute = `${host}/customer-service/whatsapp-settings`

export const getCsReportRoute = `${host}/reports/customer-service`
export const exportCsReportRoute = `${host}/reports/customer-service/export`

// Custom operational reports (WP Branch / Products / Graduation / QR)
export const getBranchReportRoute = `${host}/reports/branch`
export const exportBranchReportRoute = `${host}/reports/branch/export`
export const getProductsByBranchReportRoute = `${host}/reports/products-by-branch`
export const getGraduationReportRoute = `${host}/reports/graduation`
export const getQrAttributionReportRoute = `${host}/reports/qr-attribution`

export const getOurDesignsRoute = `${host}/customer-service/our-designs`
export const createOurDesignRoute = `${host}/customer-service/our-designs`
export const deleteOurDesignByIdRoute = (id) =>
  `${host}/customer-service/our-designs/${id}`
export const bulkDeleteOurDesignsRoute = `${host}/customer-service/our-designs/bulk-delete`
export const sendOurDesignWhatsappRoute = `${host}/customer-service/our-designs/send-whatsapp`
export const downloadOurDesignsRoute = `${host}/customer-service/our-designs/download`

export const getFeedbackQrPublicRoute = (slug) =>
  `${host}/customer-service/public/qr/${encodeURIComponent(slug)}`
export const submitPublicFeedbackRoute = `${host}/customer-service/public/submit`
export const submitOrderFeedbackRoute = `${host}/customer-service/public/order-submit`
export const getOrderFeedbackContextRoute = (token) =>
  `${host}/customer-service/public/order-context?token=${encodeURIComponent(token)}`

// RBAC / Access Control
export const getRbacCatalogPermissionsGroupedRoute = `${host}/rbac/catalog/permissions-grouped`
export const getRbacRolesRoute = `${host}/rbac/roles`
export const createRbacRoleRoute = `${host}/rbac/roles`
export const deleteRbacRoleRoute = (roleId) => `${host}/rbac/roles/${roleId}`
export const getRbacRolePermissionsRoute = (roleId) => `${host}/rbac/roles/${roleId}/permissions`
export const syncRbacRolePermissionsRoute = (roleId) => `${host}/rbac/roles/${roleId}/permissions`
export const getRbacUsersRoute = `${host}/rbac/users`
export const createRbacUserRoute = `${host}/rbac/users`
export const deleteRbacUserRoute = (userId) => `${host}/rbac/users/${userId}`
export const getRbacAccessContextRoute = `${host}/rbac/me/access-context`
export const assignRbacUserRoleRoute = (userId, roleId) => `${host}/rbac/users/${userId}/roles/${roleId}`
export const revokeRbacUserRoleRoute = (userId, roleId) => `${host}/rbac/users/${userId}/roles/${roleId}`
export const syncRbacUserBranchesRoute = (userId) => `${host}/rbac/users/${userId}/branches`
