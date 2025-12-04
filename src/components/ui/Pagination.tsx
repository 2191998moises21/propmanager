import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  total?: number;
  limit?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  total,
  limit,
}) => {
  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex pagination with ellipsis
      if (currentPage <= 3) {
        // Near start
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * (limit || 0) + 1;
  const endItem = Math.min(currentPage * (limit || 0), total || 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
      {/* Info section */}
      {showInfo && total !== undefined && limit !== undefined && (
        <div className="text-sm text-gray-600">
          Mostrando <span className="font-semibold">{startItem}</span> a{' '}
          <span className="font-semibold">{endItem}</span> de{' '}
          <span className="font-semibold">{total}</span> resultados
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md
            transition-colors
            ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                : 'text-gray-700 hover:bg-gray-100 bg-white border border-gray-300'
            }
          `}
          aria-label="Página anterior"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {renderPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`
                  px-3 py-2 text-sm font-medium rounded-md
                  transition-colors
                  ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100 bg-white border border-gray-300'
                  }
                `}
                aria-label={`Página ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md
            transition-colors
            ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                : 'text-gray-700 hover:bg-gray-100 bg-white border border-gray-300'
            }
          `}
          aria-label="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
