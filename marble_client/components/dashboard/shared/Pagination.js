function Pagination({
  currentPage = 1,
  pageCount = 1,
  onPageChange,
  pageLimit = 10,
  totalEntries = 0,
}) {
  const safePage = Number(currentPage) || 1;
  const safeLimit = Number(pageLimit) || 10;
  const safeTotal = Number(totalEntries) || 0;
  const safePageCount = Math.max(1, Number(pageCount) || 1);
  const showingFrom = safeTotal === 0 ? 0 : (safePage - 1) * safeLimit + 1;

  const MAX_PAGES_DISPLAYED = 5;

  const getPaginationRange = () => {
    const start = Math.max(2, safePage - Math.floor(MAX_PAGES_DISPLAYED / 2));
    const end = Math.min(safePageCount - 1, start + MAX_PAGES_DISPLAYED - 1);
    const range = [];

    if (start > 2) range.push("start-ellipsis");
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    if (end < safePageCount - 1) range.push("end-ellipsis");

    return range;
  };

  const renderPageNumber = (pageNumber, index) => {
    if (pageNumber === "start-ellipsis" || pageNumber === "end-ellipsis") {
      return (
        <li
          key={`ellipsis-${index}`}
          className="page-item disabled d-flex align-items-center justify-content-center bg-white fw-medium"
        >
          <span className="page-link d-flex align-items-center justify-content-center bg-white fw-medium">
            ...
          </span>
        </li>
      );
    }

    return (
      <li
        key={`page-${pageNumber}`}
        className={`page-item d-flex align-items-center justify-content-center bg-white fw-medium ${
          safePage === pageNumber ? "active" : ""
        }`}
        aria-current={safePage === pageNumber ? "page" : undefined}
      >
        <a
          className="page-link d-flex align-items-center justify-content-center bg-white fw-medium"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onPageChange?.(pageNumber);
          }}
        >
          {pageNumber}
        </a>
      </li>
    );
  };

  return (
    <div className="pagination-Div d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 w-100">
      <div className="datatable-info text-muted mb-0">
        Showing <b>{showingFrom}</b> out of <b>{safeTotal}</b> entries
      </div>

      <nav aria-label="Page navigation">
        <ul className="d-flex flex-wrap justify-content-start justify-content-sm-between gap-2 gap-sm-3 mb-0 ps-0">
          <li
            className={`page-item d-flex align-items-center justify-content-center bg-white fw-medium ${
              safePage === 1 ? "disabled" : ""
            }`}
          >
            <a
              className="page-link rounded-2 d-flex align-items-center justify-content-center bg-white fw-medium"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (safePage > 1) onPageChange?.(safePage - 1);
              }}
            >
              <i className="bi bi-chevron-left position-absolute"></i>
            </a>
          </li>

          {safePage > 1 && renderPageNumber(1)}
          {getPaginationRange().map((pageNumber, index) =>
            renderPageNumber(pageNumber, index),
          )}
          {safePage < safePageCount && renderPageNumber(safePageCount)}

          <li
            className={`page-item d-flex align-items-center justify-content-center bg-white fw-medium ${
              safePage === safePageCount ? "disabled" : ""
            }`}
          >
            <a
              className="page-link rounded-2 d-flex align-items-center justify-content-center bg-white fw-medium"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (safePage < safePageCount) onPageChange?.(safePage + 1);
              }}
            >
              <i className="bi bi-chevron-right position-absolute"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Pagination;
