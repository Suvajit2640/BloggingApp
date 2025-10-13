import { Plus } from "lucide-react"; 

export const AddNote = ({ setModalOpen, setType }) => {
  return (
    <button
      className="flex items-center gap-2 px-6 py-3 
                 bg-indigo-600 text-white font-semibold 
                 rounded-full shadow-lg 
                 hover:bg-indigo-700 hover:shadow-xl 
                 transition-all duration-300 transform hover:scale-[1.02]
                 focus:outline-none focus:ring-4 focus:ring-indigo-300 w-full md:w-auto justify-center"
      onClick={() => {
        setModalOpen(true);
        setType({
          header: "Create",
          Route: "create",
          NoteTitle: "",
          NoteContent: "",
        });
      }}
    >
      <Plus size={20} />
      Create New Note
    </button>
  );
};