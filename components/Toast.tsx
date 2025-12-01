import React, { useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from './icons/HeroIcons';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

const icons = {
  success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
  warning: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />,
  error: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
};

const bgColors = {
  success: 'border-green-400',
  warning: 'border-yellow-400',
  error: 'border-red-400',
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div
      className={`relative flex items-center w-full max-w-sm p-4 mb-4 text-gray-700 bg-white rounded-lg shadow-lg border-l-4 ${bgColors[type] || 'border-gray-400'}`}
      role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
        {icons[type]}
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
        onClick={onClose}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
