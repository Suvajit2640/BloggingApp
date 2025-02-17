import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import { useEffect } from "react";
import { SortNote } from "./SortNote";
import { useNavigate } from "react-router-dom";

export const SearchNote = ({
  setrender,
  render,
  setSearch,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
}) => {
  // fetching access token

  const access = localStorage.getItem("accessToken");

  // use form hook
  const { register, handleSubmit, formState } = useForm({});

  // submit button -----------------
  const onSubmit = (data) => {
    setSearch(data.title);
    setrender(!render);
  };

  // monitoring changes
  useEffect(() => {
    if (!access) {
      navigate("/login");
    }
  }, [access, render]);
  const navigate = useNavigate();

  return (
    <>
      <form
        action="#"
        className="flex  items-center gap-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <SortNote
          sortField={sortField}
          setSortField={setSortField}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          render={render}
          setrender={setrender}
        ></SortNote>
        <div className="flex  items-center gap-10 relative w-full cursor-pointer">
          <div className=" flex  ">
            <input
              type="text"
              name="title"
              placeholder="Search Notes...."
              id="useremail"
              className="p-3 border-2 rounded  text-white bg-gray-700 rounded-e-lg focus:ring-blue-500 focus:border-blue-500
              border-s-gray-700 border-gray-600  placeholder-gray-400 ext-white w-[40vw]"
              {...register("title")}
            />
          </div>
          <button
            type="submit"
            className="absolute top-0 end-0 p-2.5 text-sm font-medium h-full text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-12"
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
            {/* <span class="sr-only">Search</span> */}
          </button>
        </div>
      </form>
    </>
  );
};
