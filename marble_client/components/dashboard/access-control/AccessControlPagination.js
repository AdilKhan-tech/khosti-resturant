import EntriesPerPageSelector from "@/components/dashboard/shared/EntriesPerPageSelector";

export default function AccessControlPagination({
  ariaLabel,
  currentPage,
  pageCount,
  pageLimit,
  showingStart,
  totalEntries,
  onPageChange,
  onPageLimitChange,
}) {
  return (
    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mt-3">
      <div className="datatable-info text-muted mb-0">
        Showing <b>{showingStart}</b> out of <b>{totalEntries}</b> entries
      </div>
      <div className="d-flex align-items-center gap-3">
        <nav aria-label={ariaLabel}>
          <ul className="pagination-Div d-flex gap-2 mb-0 ps-0">
            <li
              className={`page-item d-flex align-items-center justify-content-center bg-white fw-medium ${
                currentPage === 1 ? "disabled" : ""
              }`}
            >
              <button
                type="button"
                className="page-link rounded-2 d-flex align-items-center justify-content-center bg-white fw-medium"
                disabled={currentPage === 1}
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              >
                <i className="bi bi-chevron-left position-absolute"></i>
              </button>
            </li>
            <li
              className={`page-item d-flex align-items-center justify-content-center bg-white fw-medium ${
                currentPage === pageCount ? "disabled" : ""
              }`}
            >
              <button
                type="button"
                className="page-link rounded-2 d-flex align-items-center justify-content-center bg-white fw-medium"
                disabled={currentPage === pageCount}
                onClick={() => onPageChange(Math.min(currentPage + 1, pageCount))}
              >
                <i className="bi bi-chevron-right position-absolute"></i>
              </button>
            </li>
          </ul>
        </nav>
        <EntriesPerPageSelector
          pageLimit={pageLimit}
          onPageLimitChange={onPageLimitChange}
        />
      </div>
    </div>
  );
}

