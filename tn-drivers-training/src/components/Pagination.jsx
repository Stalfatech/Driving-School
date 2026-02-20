import React from "react";

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-20 transition-colors dark:text-white"
      >
        ◀
      </button>

      {pages.map((p, index) => (
        <React.Fragment key={p}>
          {index > 0 && pages[index - 1] !== p - 1 && <span className="text-gray-300">...</span>}
          <button
            onClick={() => onPageChange(p)}
            className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
              currentPage === p 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-300 dark:shadow-none scale-110" 
                : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white text-gray-400"
            }`}
          >
            {p}
          </button>
        </React.Fragment>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-20 transition-colors dark:text-white"
      >
        ▶
      </button>
    </div>
  );
}
