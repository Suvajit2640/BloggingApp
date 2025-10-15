import React from "react";
import home from "../assets/home.jpeg";
export default function LandingPage() {
  return (
    <div className=" bg-gray-50 p-4 sm:p-1 ">
      <div className="max-w-7xl w-full mx-auto py-8 md:py-16 lg:py-20">

        {/* Main Content Grid: Uses flex on mobile, switches to a grid layout on medium screens */}
        <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-10 lg:gap-20 items-center">

          {/* Text Content Block */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
              Think Freely, <br />
              <span className="text-indigo-600">Note Seamlessly</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg lg:text-xl text-gray-600 max-w-lg mx-auto md:mx-0">
              Capture your ideas, organize your thoughts, and never lose a brilliant insight again. NoteWorthy is designed for clarity and efficiency.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a
                href="/Register" 
                className="px-8 py-3 text-base sm:text-lg font-semibold rounded-lg shadow-lg 
                           bg-indigo-600 text-white 
                           hover:bg-indigo-700 
                           transition-all duration-300 transform hover:scale-[1.02]
                           focus:outline-none focus:ring-4 focus:ring-indigo-300"
              >
                Get Started — It's Free
              </a>
              <a
                href="/Login" 
                className="px-8 py-3 text-base sm:text-lg font-semibold rounded-lg shadow-md 
                           bg-white text-indigo-600 border border-indigo-600
                           hover:bg-indigo-50 
                           transition-all duration-300
                           focus:outline-none focus:ring-4 focus:ring-indigo-300"
              >
                Already a User? Login
              </a>
            </div>
          </div>

          <div className="w-full max-w-xl mx-auto md:max-w-none">
            <img
              src={home}
              alt="A stylized image representing seamless note-taking and digital organization"
              className="w-full h-auto object-cover rounded-xl shadow-2xl 
               transition-transform duration-500 ease-in-out 
               hover:scale-105 hover:rotate-1"
              loading="eager"
            />
          </div>

        </div>
      </div>
    </div>
  );
}