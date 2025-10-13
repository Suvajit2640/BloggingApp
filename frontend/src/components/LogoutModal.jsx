import React, { useEffect } from "react";

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose} // click outside to close
    >
      <div
        className="relative bg-white rounded-xl shadow-xl p-8 w-full max-w-md animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold transition-colors"
        onClick={onClose}
      >
        &times;
      </button>

      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
          Confirm Logout
        </h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to log out? You will need to log in again to
          access your notes.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all duration-200"
          >
            Yes, Logout
          </button>
          <button
            onClick={onClose}
            className="border border-gray-300 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};
