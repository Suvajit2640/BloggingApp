import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { EditNote } from "../components/EditNote";
import { User, Calendar, Trash2 } from "lucide-react";

export const NoteCard = ({
  setrender,
  render,
  setModalOpen,
  setType,
  search,
  page,
  total,
  setTotal,
  sortField,
  sortOrder,
}) => {
  const username = localStorage.getItem("username");
  const access = localStorage.getItem("accessToken");
  const [deleteObj, setDeleteobj] = useState("");

  let data = "";
  const [cards, setCards] = useState([]);
  const [deletemodal, setDeleteModal] = useState(false);

  const notify = (value) => {
    if (value === "success") {
      toast.success("Note Deleted Successfully! ", { autoClose: 1000 });
    } else if (value === "fail") {
      toast.error("Note Deletion failed. Try again", { autoClose: 2000 });
    } else if (value == "not exist") {
      toast.error("Cannot delete!! Note Doesnot Exist");
    }
  };

  // fetching notes
  const fetchInfo = async () => {
    const title = search;
    const response = await axios.post(
      `http://localhost:8000/note/getAllnote?sortField=${sortField}&sortOrder=${sortOrder}&page=${page}&limit=4`,
      { title },
      {
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
      }
    );

    await setTotal(response.data.total);

    data = await response.data.data;
    data.forEach((value) => {
      let date = value.createdAt;
      let newDate = date.slice(0, 10);
      value.createdAt = newDate;
    });
    setCards(data);
  };

  const deleteCards = async (id) => {
    try {
      console.log(access);
      const response = await axios.delete(
        `http://localhost:8000/note/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${access}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === 200) {
        notify("success");
        setrender(!render);
        setTotal(total - 1);
      }
      if (response.data.status === 404) {
        notify("not exist");
      }
    } catch (error) {
      console.log(error);
      notify("fail");
    }
  };

  useEffect(() => {
    fetchInfo();
  }, [render]);


  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
      >
        <div
          className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full relative transform transition-all duration-300 scale-100"
        >
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            onClick={onClose}
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
            onClick={() => {
              deleteCards(deleteObj);
              onClose();
            }}
          >
            Yes, Delete
          </button>
        </div>
      </Modal>
    );
  };



  return (
    <>
      {cards.map((dataObj, index) => (
        <div
          key={index}
          className="group relative flex flex-col justify-between 
                   bg-gradient-to-br from-white via-gray-50 to-indigo-50/30 
                   border border-gray-200 rounded-2xl shadow-md p-6 sm:p-7 
                   transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-2 
                   hover:border-indigo-300 hover:ring-2 hover:ring-indigo-200/70
                   hover:bg-gradient-to-tl hover:from-indigo-50 hover:to-white
                   w-full max-w-sm sm:max-w-md lg:max-w-lg mx-2 my-3"
        >

          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <div className="flex flex-col text-sm text-gray-600">
              <p className="flex items-center gap-2 font-medium text-gray-800 group-hover:text-indigo-600 transition-all duration-300">
                <User
                  size={16}
                  className="text-indigo-500 group-hover:rotate-6 transition-transform duration-300"
                />
                {username}
              </p>
              <p className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={14} className="text-gray-400" />
                {dataObj.createdAt}
              </p>
            </div>

            <span className="text-[11px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md uppercase tracking-wide shadow-sm group-hover:bg-indigo-200 transition-all">
              Note
            </span>
          </div>

          <div className="flex flex-col flex-grow mb-4">
            <h3
              className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 truncate 
                       group-hover:text-indigo-700 transition-colors duration-300"
            >
              {dataObj.title}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-4 group-hover:text-gray-800 transition-colors">
              {dataObj.content}
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
                  NoteTitle: dataObj.title,
                  NoteContent: dataObj.content,
                  data_id: dataObj._id,
                }) || setModalOpen(true)
              }
              className="px-4 py-2 text-sm font-medium text-indigo-600 
                       rounded-lg active:scale-95 transition-all duration-300 
                       flex items-center gap-1 shadow-sm hover:text-indigo-700 
                       hover:bg-indigo-50"
            />

            <button
              className="p-2.5 bg-red-500 text-white rounded-lg shadow-sm 
                       hover:bg-red-600 hover:shadow-md active:scale-95 
                       transition-all duration-300 flex items-center gap-1"
              onClick={() => {
                setDeleteModal(true);
                setDeleteobj(dataObj._id);
              }}
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