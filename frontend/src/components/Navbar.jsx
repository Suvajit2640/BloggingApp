import React, { useEffect, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { LuCircleUserRound } from "react-icons/lu";
import { Menu, X } from 'lucide-react';
import { UserContext } from "../context/UserContext";
import { ProfileModal } from "./profile";
import { LogoutModal } from "./LogoutModal";

export const Navbar = () => {
  const navigate = useNavigate();
  const { isLogin, setIsLogin } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  let username = localStorage.getItem("username");

  const displayUsername = username ? username.split(" ")[0].trim() : "User";

  let access = localStorage.getItem("accessToken");

  useEffect(() => {
    const storedImage = localStorage.getItem("profileImage");
    setProfileImage(storedImage || null); 
  }, []);


  const logout = () => {
    setIsLogin(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("profileImage");
    setProfileImage("");
    navigate("/LandingPage");
    setShowLogoutModal(false);
    setIsMenuOpen(false);
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
    setIsMenuOpen(false);
    setIsModalOpen(true);
  };


  const closeProfileModal = () => {
    setIsModalOpen(false);
  };

  const handleImageUpload = (imageUrl) => {
    localStorage.setItem("profileImage", imageUrl);
    setProfileImage(imageUrl);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const renderProfileWidget = ({ isMobile = false }) => (
    <div className="relative cursor-pointer" onClick={openProfileModal}>
      {profileImage ? (
        <img
          src={profileImage}
          alt="Profile"
          className="w-7 h-7 md:w-10 lg:h-10 rounded-full object-cover ring-2 ring-indigo-400 hover:ring-indigo-600 transition-all"
        />
      ) : (
        <LuCircleUserRound className="text-indigo-500 hover:text-indigo-700 transition-colors w-7 h-7 md:w-10 lg:h-10" />
      )}
    </div>
  );


  const unauthenticatedLinks = (
    <>
      <li>
        <Link
          to="/Register"
          onClick={closeMenu}
          className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-lg"
        >
          Register
        </Link>
      </li>
      <li>
        <Link
          to="/Login"
          onClick={closeMenu}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all font-medium text-lg whitespace-nowrap"
        >
          Login
        </Link>
      </li>
    </>
  );

  return (
    <>
      <nav className=" bg-cyan-100 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link to={isLogin ? "/Notes" : "/LandingPage"} className="flex gap-2 items-center text-indigo-600 hover:text-indigo-800 transition-colors">
                <HiOutlinePencilSquare size={28} className="text-indigo-600" />
                <h2 className="font-extrabold text-2xl tracking-tight">NoteWorthy</h2>
              </Link>
            </div>

            <div className="hidden md:flex space-x-6 items-center">
              {isLogin ? (
                <div className="flex items-center space-x-5">
                  <span className="font-semibold text-xl text-gray-700">
                    Welcome, {displayUsername}
                  </span>
                  {renderProfileWidget({ isMobile: false })}
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg shadow hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <ul className="flex items-center space-x-6">
                  {unauthenticatedLinks}
                </ul>
              )}
            </div>


            <div className="md:hidden flex items-center sm:space-x-3">
              {isLogin && renderProfileWidget({ isMobile: true })}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? "max-h-screen opacity-100 py-2" : "max-h-0 opacity-0"
            } bg-gray-50 border-t border-gray-100`}
        >
          <div className="px-4 pt-2 pb-3 space-y-3">
            {isLogin ? (
              <div className="flex flex-col space-y-3 items-start">
                <span className="font-semibold text-lg text-gray-700 px-1">
                  Signed in as: {displayUsername}
                </span>

                <button
                  onClick={() => { setShowLogoutModal(true); closeMenu(); }}
                  className="block w-full text-center px-3 py-2 text-base font-medium text-white bg-red-500 rounded-lg shadow hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <ul className="space-y-2">
                <li className="block">
                  <Link
                    to="/Register"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-indigo-600 rounded-md transition-colors"
                  >
                    Register
                  </Link>
                </li>
                <li className="block">
                  <Link
                    to="/Login"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-base font-medium text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 transition-colors text-center"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>

      <ProfileModal
        isOpen={isModalOpen}
        onClose={closeProfileModal}
        onImageUpload={handleImageUpload}
        currentImage={profileImage}
      />
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
      />
    </>
  );
};