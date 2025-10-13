import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { UploadCloud, X } from "lucide-react";
import { Upload } from "lucide-react";

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

export const ProfileModal = ({ isOpen, onClose, onImageUpload }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  let access = localStorage.getItem("accessToken");

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("file", data.file[0]);
      const response = await axios.post(
        `http://localhost:8000/note/fileupload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${access}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("File uploaded successfully!");
        onImageUpload(response.data.file);
        reset();
        onClose();
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error("File already exists.");
      } else {
        toast.error("File upload failed.");
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm relative 
                   border border-gray-100 transform transition-transform"
      >

        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1"
          onClick={onClose}
          aria-label="Close Profile Upload Modal"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center">
          <UploadCloud size={36} className="text-indigo-600 mb-3" />
          <h1 className="font-extrabold text-2xl text-gray-800 mb-6">
            Update Profile Photo
          </h1>

          <form
            className="flex flex-col items-center gap-6 w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col items-start w-full">
              <label
                htmlFor="file-upload"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Choose Image File (JPG, PNG)
              </label>
              <input
                id="file-upload"
                className={`block w-full text-sm text-gray-600 
                            file:mr-4 file:py-2 file:px-4 
                            file:rounded-full file:border-0 
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100
                            border ${errors.file ? 'border-red-500' : 'border-gray-300'} 
                            rounded-lg shadow-sm cursor-pointer`}
                type="file"
                aria-label="Upload Profile Pic"
                {...register("file", { required: "Please select an image file." })}
              />


              {errors.file ? (
                <span className="text-red-500 text-xs mt-2 font-medium">
                  {errors.file.message}
                </span>
              ) : (
                <span className="text-red-500 text-xs mt-2 invisible h-4"></span>
              )}
            </div>


            <button
              type="submit"
              className="flex items-center justify-center gap-2 py-2 px-6 
                         bg-indigo-600 text-white rounded-lg text-lg font-semibold 
                         shadow-md hover:bg-indigo-700 hover:scale-[1.03] 
                         active:scale-95 transition-all duration-300"
            >
              <Upload size={20} />
              Save
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};