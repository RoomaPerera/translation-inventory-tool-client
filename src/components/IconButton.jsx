
import React from 'react';
import { PencilSquareIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';

const icons = {
  edit: PencilSquareIcon,      // v2 replacement for PencilIcon
  delete: TrashIcon,
  download: ArrowDownTrayIcon, // v2 replacement for DownloadIcon
};

const styleVariants = {
  default: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  danger: 'border-gray-300 bg-white text-gray-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300',
};

export const IconButton = ({ children, icon, variant = 'default', onClick, type = 'button' }) => {
  const IconComponent = icons[icon];
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm border transition-colors ${styleVariants[variant]}`}
    >
      {IconComponent && <IconComponent className="h-5 w-5" />}
      <span>{children}</span>
    </button>
  );
};