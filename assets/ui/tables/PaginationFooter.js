'use client';

const PaginationFooter = ({
  currentPage = 1,
  totalPages = 1,
  startIndex = 0,
  endIndex = 0,
  totalItems = 0,
  rowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 15, 20],
  onPageChange,
  onRowsPerPageChange
}) => {
  const handlePrevPage = () => {
    onPageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    onPageChange(currentPage + 1);
  };

  const handleRowsPerPageChange = (e) => {
    onRowsPerPageChange(Number(e.target.value));
  };

  return (
    <div className="table-footer">
      <div className="footer-left">
        Showing {startIndex} to {endIndex} of {totalItems} items
      </div>

      <div className="footer-center">
        <button
          className="footer-nav-btn"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          &lt; Prev
        </button>

        <span className="footer-page-number">
          {currentPage}
        </span>

        <button
          className="footer-nav-btn"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next &gt;
        </button>
      </div>

      <div className="footer-right">
        <span>Items per Page</span>
        <select
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
        >
          {rowsPerPageOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PaginationFooter;
