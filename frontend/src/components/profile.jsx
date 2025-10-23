import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { UploadCloud, X, Upload, Trash2 } from "lucide-react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50 p-4"
      onClick={onClose}
    >
      <div
        className="transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const ProfileModal = ({ isOpen, onClose, onImageUpload, currentImage }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const access = localStorage.getItem("accessToken");

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("profilePic", data.file[0]);
      const response = await axios.post(`${API_URL}/upload-profile`, formData, {
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success(response.data.message || "Profile picture uploaded successfully!");
        onImageUpload(response.data.url);
        reset();
        onClose();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Upload failed!");
    }
  };

 
  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${API_URL}/delete-profile`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      if (response.data.success) {
        toast.success(response.data.message || "Profile picture deleted successfully!");
        onImageUpload("");
        localStorage.removeItem("profileImage");
        onClose();
      } else {
        toast.error(response.data.message || "Delete failed!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      if (error.response) {
        toast.error(error.response.data?.message || "Failed to delete profile picture!");
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm relative border border-gray-100">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center">
          <UploadCloud size={36} className="text-indigo-600 mb-3" />
          <h1 className="font-extrabold text-2xl text-gray-800 mb-6">
            Update Profile Photo
          </h1>

          {currentImage && currentImage.trim() !== "" && (
            <div className="mb-4">
              <img
                src={currentImage}
                alt="Current Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.src = ""; 
                }}
              />
            </div>
          )}

          <form className="flex flex-col items-center gap-6 w-full" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col items-start w-full">
              <label htmlFor="file-upload" className="text-sm font-medium text-gray-700 mb-1">
                Choose Image File (JPG, PNG)
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                className={`block w-full text-sm text-gray-600 
              file:mr-4 file:py-2 file:px-4 
              file:rounded-full file:border-0 
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100
              border ${errors.file ? 'border-red-500' : 'border-gray-300'} 
              rounded-lg shadow-sm cursor-pointer`}
                {...register("file", { required: "Please select an image file." })}
              />

              {errors.file && (
                <span className="text-red-500 text-xs mt-2 font-medium">{errors.file.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 py-2 px-6 bg-indigo-600 text-white rounded-lg text-lg font-semibold shadow-md hover:bg-indigo-700 hover:scale-[1.03] active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <Upload size={20} />
              Upload
            </button>
          </form>

          {currentImage && currentImage.trim() !== "" && (
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 mt-4 py-2 px-6 bg-red-500 text-white rounded-lg text-lg font-semibold shadow-md hover:bg-red-600 hover:scale-[1.03] active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <Trash2 size={20} />
              Delete
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};