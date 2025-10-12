import { ChevronLeft, ChevronRight } from "lucide-react";  
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const PaginateButton = ({ page, setPage, setrender, render ,total}) => {
  const navigate = useNavigate();
  
  const totalPages = Math.ceil(total / 4); 
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages || totalPages === 0;

  const nextPage = () => {
    if (!isLastPage) { 
      setPage(page + 1);
      setrender(!render);
    }
  };
  
  const prevPage = () => {
    if (!isFirstPage) {
      setPage(page - 1);
      setrender(!render);
    }
  };
  
  const access = localStorage.getItem("accessToken");
  
  useEffect(() => {
    if (!access) {
      navigate("/login");
    }
  }, [access, render]);
  
  if (total === 0) return null; 

  return (
    <div className="fixed bottom-0 left-0 right-0 py-3 bg-white border-t border-gray-200 shadow-inner z-20">
      <div className="flex justify-center items-center gap-4">
        
        <button 
          onClick={prevPage}
          disabled={isFirstPage}
          className={`p-2 rounded-full transition-colors duration-200 
                      ${isFirstPage ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800'}`}
        >
          <ChevronLeft size={24} />
        </button>

        <span className="text-lg font-semibold text-indigo-700 bg-indigo-50 px-4 py-1 rounded-full border border-indigo-200 shadow-sm">
          Page {page} of {totalPages}
        </span>
        
        <button 
          onClick={nextPage}
          disabled={isLastPage}
          className={`p-2 rounded-full transition-colors duration-200 
                      ${isLastPage ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800'}`}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};