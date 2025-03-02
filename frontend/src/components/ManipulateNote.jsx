import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import closeIcon from "../assets/closeIcon.jpg";

// validating the schema
const validateNote = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long !!" }),
  content: z.string() .min(1, { message: "Content cannot be null" }),
  
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

  // generate toast messages
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

  // handling submit button
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

  // defining the modal
  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-blue-500 bg-opacity-50 z-10">
        <div className="">{children}</div>
      </div>
    );
  };

  // monitoring changes
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

  // returning the modal
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <>
        <div className="note-container relative">
          <button
            className="absolute top-5 right-7 text-xl text-black hover:text-gray-700"
            onClick={onClose}
          >
            <img src={closeIcon} alt="" className="w-8" />
          </button>
          <div className="items-center flex flex-col justify-center m-0 p-0">
            <div className="flex flex-col gap-7 bg-[#0077b6] p-2 rounded-lg h-[90vh] w-[45vw] items-center justify-center">
              <form
                action="#"
                className="flex flex-col items-center gap-3"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="flex flex-col gap-10 justify-center items-center p-3">
                  <h1 className="font-bold text-3xl text-white">
                    {type.header} Post
                  </h1>
                  <div className="flex gap-1 flex-col">
                    <input
                      className="placeholder:text-gray-500 placeholder:italic placeholder:text-2xll min-w-[40vw] min-h-[10vh] placeholder:font-semibold p-2 text-2x"
                      type="text"
                      placeholder="New note title here..."
                      autoComplete="off"
                      aria-label="Post Title"
                      autoFocus="on"
                      {...register("title")}
                    />
                    {errors.title ? (
                      <span className="text-yellow-400 text-lg font-semibold">
                        {errors.title.message}
                      </span>
                    ) : (
                      <p className="text-yellow-400 text-lg font-semibold invisible">
                        " "
                      </p>
                    )}
                    <textarea
                      aria-label="Post Content"
                      placeholder="Write your content here..."
                      className="min-h-[35vh] p-2 placeholder:text-2xl text-2xl"
                      {...register("content")}
                    />
                    {errors.content ? (
                      <span className="text-yellow-400 text-lg font-semibold">
                        {errors.content.message}
                      </span>
                    ) : (
                      <p className="text-yellow-400 text-lg font-semibold invisible">
                        " "
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  className="text-xl border-black border-2 p-2 px-5 bg-blue-100 rounded transition ease-in-out delay-150 hover:scale-105 hover:bg-cyan-500 duration-500 hover:text-white"
                >
                  Save
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    </Modal>
  );
};
