import { useForm } from "react-hook-form";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react"; 
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
    <form action="#" className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full mt-[10px]  md:w-auto">

      <div className="relative w-full sm:w-80">
        <input
          type="text"
          name="title"
          placeholder="Search notes by title..."
          className="p-3 pl-10 border border-gray-300 rounded-lg bg-white placeholder-gray-500 w-full focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-sm"
          {...register("title")}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>
      
      <SortNote
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        render={render}
        setrender={setrender}
      />
    </form>
  );
};