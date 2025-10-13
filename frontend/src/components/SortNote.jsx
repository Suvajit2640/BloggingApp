import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { ListFilter } from "lucide-react"; 

export const SortNote = ({ sortField, setSortField, sortOrder, setSortOrder, render, setrender }) => {
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc"); 
    setrender(!render);
  };

  const handleSortFieldChange = (e) => {
    setSortField(e.target.value);
    setrender(!render);
  };

  return (
    <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-300 w-full sm:w-auto">
      <ListFilter size={20} className="text-gray-500 hidden sm:block" />
      

      <select
        name="sortField"
        id="sortField"
        className="p-1 text-gray-700 bg-white rounded-md cursor-pointer outline-none appearance-none"
        value={sortField}
        onChange={handleSortFieldChange}
      >
        <option value="title">Title</option>
        <option value="createdAt">Date</option>
      </select>

      <button 
        type="button" 
        onClick={toggleSortOrder}
        className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
        aria-label={`Sort order: currently ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
      >
        {sortOrder === "asc" ? <FaArrowUp size={16} /> : <FaArrowDown size={16} />}
      </button>
    </div>
  );
};