import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export const PaginateButton = ({
  page = 1,
  setPage,
  total = 0,
  itemsPerPage = 4,
}) => {
  const totalPages = Math.ceil(total / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
    }
  };

  const getPageNumbers = () => {
    const maxVisible = 5;
    const pages = [];

    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const showFirstLast = totalPages > 7;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Page Info - Mobile Top, Desktop Left */}
          <div className="text-sm text-gray-600 font-medium order-1 sm:order-none">
            Showing <span className="text-indigo-600 font-semibold">{Math.min((page - 1) * itemsPerPage + 1, total)}</span>
            {" "}-{" "}
            <span className="text-indigo-600 font-semibold">{Math.min(page * itemsPerPage, total)}</span>
            {" "}of{" "}
            <span className="text-indigo-600 font-semibold">{total}</span> notes
          </div>

          {/* Pagination Controls - Center */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* First Page Button */}
            {showFirstLast && (
              <button
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                className={`hidden sm:flex items-center justify-center w-9 h-9 rounded-lg font-medium text-sm transition-all duration-200
                  ${page === 1
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
                  }`}
                aria-label="First Page"
              >
                <ChevronsLeft size={18} />
              </button>
            )}

            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                ${page === 1
                  ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm hover:shadow-md"
                }`}
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {/* Show first page if not in range */}
              {showFirstLast && pageNumbers[0] > 1 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200"
                  >
                    1
                  </button>
                  {pageNumbers[0] > 2 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                </>
              )}

              {pageNumbers.map((pageNum, index) => {
                const isCurrent = page === pageNum;
                return (
                  <button
                    key={index}
                    onClick={() => handlePageChange(pageNum)}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg font-medium text-sm transition-all duration-200
                      ${isCurrent
                        ? "bg-indigo-600 text-white shadow-md scale-110"
                        : "bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
                      }`}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Show last page if not in range */}
              {showFirstLast && pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                ${page === totalPages
                  ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm hover:shadow-md"
                }`}
              aria-label="Next Page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>

            {/* Last Page Button */}
            {showFirstLast && (
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages}
                className={`hidden sm:flex items-center justify-center w-9 h-9 rounded-lg font-medium text-sm transition-all duration-200
                  ${page === totalPages
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
                  }`}
                aria-label="Last Page"
              >
                <ChevronsRight size={18} />
              </button>
            )}
          </div>

          {/* Page Indicator - Mobile Bottom, Desktop Right */}
          <div className="text-sm font-semibold text-gray-700 hidden sm:block">
            Page {page} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
};