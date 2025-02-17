import { BsFillArrowLeftCircleFill } from "react-icons/bs";
import { BsFillArrowRightCircleFill } from "react-icons/bs";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const PaginateButton = ({ page, setPage, setrender, render }) => {
  const navigate = useNavigate();
  const nextPage = () => {
    setPage(page + 1);
    setrender(!render);
  };
  const prevPage = () => {
    setPage(page - 1);
    setrender(!render);
  };
  const access = localStorage.getItem("accessToken");
  // monitoring changes
  useEffect(() => {
    if (!access) {
      navigate("/login");
    }
  }, [access, render]);
  return (
    <>
    <div className="w-[100vw] absolute bottom-0 flex justify-center">

      <div className="button-container flex items-center gap-3  ">
        <button onClick={prevPage}>
          <BsFillArrowLeftCircleFill size={30} />
        </button>

        <span className="text-2xl  p-3 rounded">Page-{page}</span>
        <button onClick={nextPage}>
          <BsFillArrowRightCircleFill size={30} />
        </button>
      </div>
    </div>
    </>
  );
};
