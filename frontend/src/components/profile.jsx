import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import closeIcon from "../assets/closeIcon.jpg";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-blue-500 bg-opacity-50 z-10">
      <div className="">{children}</div>
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
      <div className="note-container relative bg-white rounded-lg shadow-lg p-6">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &#x2715;
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-bold text-3xl text-[#0077b6] mb-4">
            Upload Profile Pic
          </h1>
          <form
            className="flex flex-col items-center gap-4 w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col items-center w-full">
              <input
                className={`border ${errors.file ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 w-full max-w-[400px] placeholder:text-gray-500 placeholder:italic`}
                type="file"
                aria-label="Upload Profile Pic"
                {...register("file", { required: "File is required" })}
              />
              {errors.file?(<span className="text-red-500 mt-2 ">{errors.file.message}</span>) : (
                <span className="text-red-500 mt-2 invisible">"</span>
              )}
            </div>
            <button
              type="submit"
              className="text-xl border-black border-2 p-2 px-5 bg-[#0077b6] text-white rounded-lg transition duration-300 ease-in-out hover:bg-[#005f8a] hover:scale-105"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};