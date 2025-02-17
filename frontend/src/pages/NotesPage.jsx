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
  const [render, setrender] = useState();
  const [search, setSearch] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total,setTotal]=useState(1);
  const [sortField, setSortField] = useState("title"); 
  const [sortOrder, setSortOrder] = useState("asc"); 

  const [type, setType] = useState({
    header: "Create",
    Route: "create",
    NoteTitle: "",
    NoteContent: "",
    data_id: "",
  });

  useEffect(() => {
    if (!access) {
      navigate("/LandingPage");
    }
  }, [access, navigate, render]);

  return (
    <>
      <div className="flex-col flex justify-center">
        <div className="items-center justify-center flex w-screen flex-col relative">
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

          <ManipulateNote
            setrender={setrender}
            render={render}
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            type={type}
          />
        </div>

        <div className="flex flex-wrap  items-center justify-center relative">
          <NoteCard
            setrender={setrender}
            render={render}
            onClose={() => setModalOpen(false)}
            setModalOpen={setModalOpen}
            setType={setType}
            search={search}
            setSearch={setSearch}
            page={page}
            setPage={setPage}
            total={total}
            setTotal={setTotal}
            sortField={sortField} 
            sortOrder={sortOrder} 
          />
        </div>
        <PaginateButton
          page={page}
          setPage={setPage}
          setrender={setrender}
          render={render}
          total={total}
          setTotal={setTotal}
        ></PaginateButton>
      </div>
    </>
  );
};
