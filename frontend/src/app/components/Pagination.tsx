import React from 'react';
import Icon from '@mdi/react';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalItems, pageSize, onPageChange }: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-8 mb-8">
        <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
            <Icon path={mdiChevronLeft} size={1} />
        </button>

        <span className="text-sm font-medium flex items-center gap-2">
            <span className="border border-gray-300 px-4 py-1 rounded-md bg-white text-gray-900 shadow-sm">{currentPage + 1}</span>
            <span className="text-gray-500">of {totalPages}</span>
        </span>

        <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
            <Icon path={mdiChevronRight} size={1} />
        </button>
    </div>
  );
};

export default Pagination;

