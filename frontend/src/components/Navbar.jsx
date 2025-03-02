import React, { useEffect, useContext, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { LuCircleUserRound } from "react-icons/lu";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { ProfileModal } from "./profile";

export const Navbar = () => {
  const navigate = useNavigate();
  const { isLogin, setIsLogin } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  let username = localStorage.getItem("username");
  if (username !== null) {
    username = username.split(" ")[0].trim();
  }
  let access = localStorage.getItem("accessToken");

  const logout = () => {
    setIsLogin(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("profileImage");
    navigate("/LandingPage");
    setProfileImage("")
  };

  useEffect(() => {
    if (access === null) {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
    const storedImage = localStorage.getItem("profileImage");
    if (storedImage) {
      setProfileImage(storedImage);
    }
  }, [access, setIsLogin]);

  const openProfileModal = () => {
    setIsModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsModalOpen(false);
  };

  const handleImageUpload = (imageUrl) => {
    localStorage.setItem("profileImage", imageUrl);
    setProfileImage(imageUrl);
  };
  return (
    <>
      <nav className="navbar flex justify-between p-3 px-15 bg-cyan-100 h-[10vh]">
        <div className="nav-heading-container flex items-center gap-2 hover:cursor-pointer">
          <Link to="Notes" className="flex gap-2 items-center">
            <div className="nav-icon">
              <HiOutlinePencilSquare size={30} />
            </div>
            <div className="nav-heading font-bold text-xl">
              <h2>NoteWorthy</h2>
            </div>
          </Link>
        </div>
        {isLogin ? (
          <div className="nav-items flex">
            <ul className="flex gap-5 text-lg items-center ">
              <li className="font-semibold text-2xl">Welcome, {username}</li>
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-12 h-12 rounded-full cursor-pointer"
                  onClick={openProfileModal}
                />
              ) : (
                <LuCircleUserRound
                  size={40}
                  className="cursor-pointer"
                  onClick={openProfileModal}
                />
              )}
              <li onClick={logout}>
                <Link
                  to="LandingPage"
                  className="text-md border-black border-2 p-1 px-3 bg-black text-white rounded transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 hover:bg-slate-800 duration-300"
                >
                  Logout
                </Link>
              </li>
            </ul>
          </div>
        ) : (
          <div className="nav-items flex">
            <ul className="flex gap-5 text-lg">
              <li>
                <Link
                  to="Register"
                  className="transition-all ease-in-out delay-150 hover:text-slate-600 hover:scale-110 duration-200"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  to="Login"
                  className=" text-md border-black border-2 p-1 px-3 bg-black text-white rounded transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 hover:bg-slate-800 duration-300"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      <ProfileModal
        isOpen={isModalOpen}
        onClose={closeProfileModal}
        onImageUpload={handleImageUpload}
      />
    </>
  );
};
