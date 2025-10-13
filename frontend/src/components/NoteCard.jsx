import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { EditNote } from "../components/EditNote";
import { User, Calendar, Trash2, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export const NoteCard = ({
  setrender,
  render,
  setModalOpen,
  setType,
  search = "",
  page = 1,
  total = 0,
  setTotal,
  sortField = "title",
  sortOrder = "asc",
  setPage,
}) => {
  const username = localStorage.getItem("username");
  const access = localStorage.getItem("accessToken");
  const [deleteObj, setDeleteobj] = useState("");
  const [cards, setCards] = useState([]);
  const [deletemodal, setDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fetchRef = useRef(0);

  const itemsPerPage = 4;

  const notify = (value) => {
    if (value === "success") {
      toast.success("Note Deleted Successfully!", { autoClose: 1000 });
    } else if (value === "fail") {
      toast.error("Note Deletion failed. Try again", { autoClose: 2000 });
    } else if (value === "not exist") {
      toast.error("Cannot delete!! Note Does not Exist");
    } else if (value === "unauthorized") {
      toast.error("Session expired. Please log in again.", { autoClose: 3000 });
    } else if (value === "fetchError") {
      toast.error("Failed to load notes. Please try again.", { autoClose: 3000 });
    }
  };

  const fetchInfo = async () => {
    if (!access) {
      setIsLoading(false);
      return;
    }

    const fetchId = ++fetchRef.current;
    setIsLoading(true);
    const title = search || "";

    try {
      // console.log("NoteCard Fetch Start:", { page, search, sortField, sortOrder, fetchId });

      const response = await axios.post(
        `${API_URL}/note/getAllnote?sortField=${sortField}&sortOrder=${sortOrder}&page=${page}&limit=${itemsPerPage}`,
        { title },
        {
          headers: {
            Authorization: `Bearer ${access}`,
            "Content-Type": "application/json",
          },
        }
      );

      const fetchedData = response.data.data || [];
      const apiTotal = response.data.pagination?.total;

      // console.log("Full API Response:", response.data);
      // console.log("Fetched total from API:", apiTotal, "Data length:", fetchedData.length);

      if (response.data.success) {
        if (apiTotal === undefined || apiTotal === null) {
          console.warn("API didn't return total count");
        }

        if (fetchId === fetchRef.current) {
          setTotal(apiTotal || 0);
        }

        fetchedData.forEach((value) => {
          let date = value.createdAt;
          if (date) {
            value.createdAt = date.slice(0, 10);
          }
        });

        if (fetchId === fetchRef.current) {
          setCards(fetchedData);
        }

        // console.log("NoteCard Fetch Success – Set total:", apiTotal, "Cards:", fetchedData.length);
      } else {
        throw new Error("API response indicates failure");
      }
    } catch (error) {
      // console.error("NoteCard Fetch Error:", error);
      if (fetchId === fetchRef.current) {
        if (error.response?.status === 401) {
          notify("unauthorized");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("username");
          localStorage.removeItem("refreshToken");
          window.location.href = "/LandingPage";
        } else {
          notify("fetchError");
          setCards([]);
          setTotal(0);
        }
      }
    } finally {
      if (fetchId === fetchRef.current) {
        setIsLoading(false);
      }
    }
  };

  const deleteCards = async (id) => {
    if (!access || !id) return;

    try {
      const response = await axios.delete(`${API_URL}/note/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
      });

      // console.log("Delete Response:", response.data);

      const isSuccess = response.data.success !== false || response.data.status === 200;

      if (isSuccess) {
        notify("success");

        // ✅ Calculate new total and check if we need to navigate to previous page
        const newTotal = total - 1;
        const totalPages = Math.ceil(newTotal / itemsPerPage);

        // If current page would be empty after deletion, navigate to previous page
        if (page > totalPages && totalPages > 0) {
          // console.log(`Page ${page} will be empty. Navigating to page ${totalPages}`);
          setPage(totalPages);
        }

        // Trigger refetch after page update (if any)
        setrender((prev) => !prev);
        setDeleteModal(false);
      } else {
        notify("fail");
      }
    } catch (error) {
      // console.error("Delete error:", error);
      if (error.response?.status === 404) {
        notify("not exist");
      } else if (error.response?.status === 401) {
        notify("unauthorized");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("username");
        localStorage.removeItem("refreshToken");
        window.location.href = "/LandingPage";
      } else {
        notify("fail");
      }
    }
  };

  // Refetch on prop changes
  useEffect(() => {
    // console.log("NoteCard useEffect Triggered:", { render, search, page, sortField, sortOrder });
    fetchInfo();
  }, [render, search, page, sortField, sortOrder, access]);

  // ✅ Auto-navigate if current page is empty but there are notes on other pages
  useEffect(() => {
    if (cards.length === 0 && total > 0 && page > 1 && !isLoading) {
      // console.log("Empty page detected, navigating back to page 1");
      setPage(1);
    }
  }, [cards.length, total, page, isLoading]);

  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full relative transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            onClick={onClose}
            aria-label="Close modal"
          >
            &#x2715;
          </button>
          {children}
        </div>
      </div>
    );
  };

  const DeleteModal = ({ isOpen, onClose }) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to permanently remove this note? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
            onClick={() => deleteCards(deleteObj)}
          >
            Yes, Delete
          </button>
        </div>
      </Modal>
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="col-span-full flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
        <span className="text-gray-600">Loading your notes...</span>
      </div>
    );
  }

  // Empty State
  if (cards.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-gray-500 text-lg mb-4">
          {search ? `No notes found for "${search}". Try a different search.` : "No notes yet. Create your first one!"}
        </p>
        {search ? (
          <button
            onClick={() => setrender((prev) => !prev)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Clear Search
          </button>
        ) : (
          <p className="text-sm text-gray-400">Total notes: {total}</p>
        )}
      </div>
    );
  }

  // Render Cards
  return (
    <>
      {cards.map((dataObj) => (
        <div key={dataObj._id} className="group relative flex flex-col justify-between bg-gradient-to-br from-white via-gray-50 to-indigo-50/30 border border-gray-200 rounded-2xl shadow-md p-6 sm:p-7 transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-300 hover:ring-2 hover:ring-indigo-200/70 hover:bg-gradient-to-tl hover:from-indigo-50 hover:to-white">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <div className="flex flex-col text-sm text-gray-600">
              <p className="flex items-center gap-2 font-medium text-gray-800 group-hover:text-indigo-600 transition-all duration-300">
                <User size={16} className="text-indigo-500 group-hover:rotate-6 transition-transform duration-300" />
                {username || "Unknown User"}
              </p>
              <p className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={14} className="text-gray-400" />
                {dataObj.createdAt || "Unknown Date"}
              </p>
            </div>
            <span className="text-[11px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md uppercase tracking-wide shadow-sm group-hover:bg-indigo-200 transition-all">
              Note
            </span>
          </div>

          <div className="flex flex-col flex-grow mb-4">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 truncate group-hover:text-indigo-700 transition-colors duration-300">
              {dataObj.title || "Untitled Note"}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-4 group-hover:text-gray-800 transition-colors">
              {dataObj.content || "No content available."}
            </p>
          </div>

          <div className="flex justify-between items-center border-t pt-3">
            <EditNote
              setModalOpen={setModalOpen}
              setType={setType}
              dataObj={dataObj}
              onClick={() =>
                setType({
                  header: "Edit",
                  Route: "update",
                  NoteTitle: dataObj.title || "",
                  NoteContent: dataObj.content || "",
                  data_id: dataObj._id,
                }) || setModalOpen(true)
              }
              className="px-4 py-2 text-sm font-medium text-indigo-600 rounded-lg active:scale-95 transition-all duration-300 flex items-center gap-1 shadow-sm hover:text-indigo-700 hover:bg-indigo-50"
            />

            <button
              className="p-2.5 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 hover:shadow-md active:scale-95 transition-all duration-300 flex items-center gap-1"
              onClick={() => {
                setDeleteModal(true);
                setDeleteobj(dataObj._id);
              }}
              aria-label="Delete note"
            >
              <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-sm font-medium">Delete</span>
            </button>
          </div>
        </div>
      ))}

      <DeleteModal isOpen={deletemodal} onClose={() => setDeleteModal(false)} />
    </>
  );
};