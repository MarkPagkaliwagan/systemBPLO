"use client";

import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import Spinner from './Spinner';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all scale-100 opacity-100">
        <div className="bg-green-900 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-center space-x-3">
            <FiAlertTriangle className="w-6 h-6 text-yellow-300" />
            <h2 className="text-lg font-semibold text-white">Confirm Logout</h2>
          </div>
        </div>
        <div className="px-6 py-6">
          <p className="text-gray-800 text-center">
            Are you sure you want to logout? You will need to sign in again to access your account.
          </p>
        </div>
        <div className="px-6 pb-6 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-300 hover:bg-gray-400 text-white font-medium rounded-xl transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
