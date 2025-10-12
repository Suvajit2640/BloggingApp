import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
// import closeIcon from "../assets/closeIcon.jpg"; // Replaced with a modern icon
import { X, Save } from "lucide-react"; // Imported modern icons

// validating the schema (UNCHANGED)
const validateNote = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long !!" }),
  content: z.string().min(1, { message: "Content cannot be null" }),
});

export const ManipulateNote = ({
  type,
  setrender,
  render,
  isOpen,
  onClose,
}) => {
  const access = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  // use form hook
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validateNote),
  });

  // generate toast messages (UNCHANGED)
  const notify = (value) => {
    const toggle = type.header === "Create" ? "Created" : "Updated";
    const errorMessage = type.header === "Create" ? "Creation" : "Updation";

    if (value === "success") {
      toast.success(`Note ${toggle}! `, { autoClose: 2000 });
    } else if (value === "fail") {
      toast.error(`Note ${errorMessage} failed. Try again`, {
        autoClose: 3000,
      });
    } else if (value === "exists") {
      toast.error("Title already exists. Try a different one.", {
        autoClose: 3000,
      });
    }
  };

  // handling submit button (UNCHANGED)
  const onSubmit = async (data) => {
    try {
      data.title = data.title.trim();
      data.content = data.content.trim();

      let method, Route;
      if (type.header === "Create") {
        method = axios.post;
        Route = `http://localhost:8000/note/${type.Route}`;
      } else {
        method = axios.put;
        Route = `http://localhost:8000/note/update/${type.data_id}`;
      }

      const response = await method(Route, data, {
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === 200) {
        notify("success");
        setrender(!render);
        // Important: Close the modal on successful submission
        onClose();
        type.NoteTitle = data.title;
        type.NoteContent = data.content;
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        notify("exists");
      } else {
        notify("fail");
      }
    }
  };

  // defining the modal (IMPROVED UI)
  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50 p-4"
        onClick={onClose} // Close when clicking the backdrop
      >
        <div
          className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-2xl transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the modal content
        >
          {children}
        </div>
      </div>
    );
  };

  // monitoring changes (UNCHANGED)
  useEffect(() => {
    if (!access) {
      navigate("/login");
    }
    if (type.header === "Edit") {
      reset({
        title: type.NoteTitle || "",
        content: type.NoteContent || "",
      });
    } else if (type.header === "Create") {
      reset({
        title: "",
        content: "",
      });
    }
  }, [access, navigate, render, reset, type]);

  // returning the modal (IMPROVED UI)
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative p-6 sm:p-8">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
          onClick={onClose}
          aria-label="Close Note Editor"
        >
          <X size={24} />
        </button>

        {/* Form Content */}
        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Header */}
          <h1 className="font-extrabold text-3xl text-gray-800 border-b pb-3 mb-2">
            {type.header} Note
          </h1>

          {/* Inputs Container */}
          <div className="flex flex-col gap-4">

            {/* Title Input */}
            <div>
              <input
                className={`w-full text-2xl font-semibold p-3 border-b-2 
                            placeholder:text-gray-400 focus:outline-none 
                            ${errors.title ? 'border-red-500' : 'border-gray-200 focus:border-indigo-500'} 
                            transition-colors`}
                type="text"
                placeholder="Title: New note title here..."
                autoComplete="off"
                aria-label="Note Title"
                // autoFocus is applied here for better UX
                autoFocus
                {...register("title")}
              />
              {errors.title ? (
                <span className="text-red-500 text-sm font-medium mt-1 block">
                  {errors.title.message}
                </span>
              ) : (
                <p className="text-red-500 text-sm font-medium mt-1 invisible h-5">
                  &nbsp;
                </p>
              )}
            </div>

            {/* Content Textarea */}
            <div>
              <textarea
                aria-label="Note Content"
                placeholder="Write your note content here..."
                className={`w-full p-3 min-h-[30vh] text-base border-2 rounded-lg 
                            placeholder:text-gray-500 focus:outline-none 
                            ${errors.content ? 'border-red-500' : 'border-gray-200 focus:border-indigo-500'} 
                            transition-colors resize-none`}
                {...register("content")}
              />
              {errors.content ? (
                <span className="text-red-500 text-sm font-medium mt-1 block">
                  {errors.content.message}
                </span>
              ) : (
                <p className="text-red-500 text-sm font-medium mt-1 invisible h-5">
                  &nbsp;
                </p>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 mt-2 py-3 px-5 
                       bg-indigo-600 text-white font-semibold text-lg rounded-lg 
                       shadow-md hover:bg-indigo-700 
                       transition ease-in-out duration-300 transform hover:scale-[1.01]"
          >
            <Save size={20} />
            {type.header === "Create" ? "Create Note" : "Update Note"}
          </button>
        </form>
      </div>
    </Modal>
  );
};