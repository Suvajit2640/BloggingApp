import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SortNote } from "./SortNote";
import { useDebounce } from "./debounce";

export const SearchNote = ({
  setrender,
  render,
  setSearch,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
}) => {
  const access = localStorage.getItem("accessToken");
  const { register, watch } = useForm({});
  const navigate = useNavigate();

  const title = watch("title");

  const debouncedTitle = useDebounce(title, 300); 

  useEffect(() => {
    if (debouncedTitle !== undefined) {
      setSearch(debouncedTitle);
      setrender((prev) => !prev);
    }
  }, [debouncedTitle, setSearch, setrender]);

  useEffect(() => {
    if (!access) {
      navigate("/login");
    }
  }, [access, navigate]);

  return (
    <form action="#" className="flex items-center gap-5">
      <SortNote
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        render={render}
        setrender={setrender}
      />
      <div className="flex items-center gap-10 relative w-full cursor-pointer">
        <div className="flex">
          <input
            type="text"
            name="title"
            placeholder="Search Notes...."
            className="p-3 border-2 rounded-lg text-white bg-gray-700 focus:ring-blue-500 focus:border-blue-500 border-gray-600 placeholder-gray-400 w-[40vw]"
            {...register("title")}
          />
        </div>
      </div>
    </form>
  );
};
