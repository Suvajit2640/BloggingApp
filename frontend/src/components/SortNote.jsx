import { FaArrowUp, FaArrowDown } from "react-icons/fa";

export const SortNote = ({ sortField, setSortField, sortOrder, setSortOrder,render,setrender }) => {
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc"); 
    setrender(!render)
  };

  const handleSortFieldChange = (e) => {
    setSortField(e.target.value);
    setrender(!render)
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={toggleSortOrder} >
        {sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />}
      </button>
      <select
        name="sortField"
        id="sortField"
        className="p-2 rounded-lg cursor-pointer border-2 border-blue-400 hover:border-blue-400 outline-none"
        value={sortField}
        onChange={handleSortFieldChange}
      >
        <option value="title">Title</option>
        <option value="createdAt">Created At</option>
      </select>
    </div>
  );
};
