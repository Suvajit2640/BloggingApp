import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { NoteCard } from "../components/NoteCard";
import { ManipulateNote } from "../components/ManipulateNote";
import { AddNote } from "../components/AddNote";
import { SearchNote } from "../components/SearchNote";
import { PaginateButton } from "../components/PaginateButton";

export const NotesPage = () => {
  const navigate = useNavigate();
  
  const access = localStorage.getItem("accessToken");
  const [render, setrender] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortField, setSortField] = useState("title"); 
  const [sortOrder, setSortOrder] = useState("asc"); 

  const [type, setType] = useState({
    header: "Create",
    Route: "create",
    NoteTitle: "",
    NoteContent: "",
    data_id: "",
  });

  // Auth check
  useEffect(() => {
    if (!access) {
      navigate("/LandingPage", { replace: true });
    }
  }, [access, navigate]);

  // Reset to page 1 on search/sort changes
  useEffect(() => {
    if (search || sortField || sortOrder) {
      setPage(1);
      setrender((prev) => !prev);
    }
  }, [search, sortField, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar - Sticky */}
      <div className="py-6 px-4 sm:px-6 lg:px-8 bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <AddNote setModalOpen={setModalOpen} setType={setType} type={type} />
          <SearchNote
            setrender={setrender}
            render={render}
            search={search}
            setSearch={setSearch}
            sortField={sortField}
            setSortField={setSortField}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        </div>
      </div>
      
      {/* Main Content Area with bottom padding for fixed pagination */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <NoteCard
            setrender={setrender}
            render={render}
            setModalOpen={setModalOpen}
            setType={setType}
            search={search}
            page={page}
            setPage={setPage}
            total={total}
            setTotal={setTotal}
            sortField={sortField} 
            sortOrder={sortOrder} 
          />
        </div>
      </div>
      
      {/* Fixed Bottom Pagination */}
      <PaginateButton
        page={page}
        setPage={setPage}
        setrender={setrender}
        render={render}
        total={total}
        setTotal={setTotal}
      />

      {/* Edit/Create Modal */}
      <ManipulateNote
        setrender={setrender}
        render={render}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        type={type}
      />
    </div>
  );
};