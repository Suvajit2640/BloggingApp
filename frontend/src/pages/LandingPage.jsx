import React from "react";
import home from "../assets/home.jpeg"

export default function LandingPage() {
  return (
    <>
        <>
        <div className = "flex p-[20px] h-[90vh] bg-[#F8F5EE] justify-between items-center landingPage">
            <div className = "  text-7xl pl-8 font-bold landingPage-content w-[45vw] ">Think Freely, Note Seamlessly</div>
            <div className = "w-1/2  landingPage-image">
                <img src={home} alt="Landing Page Image" />
            </div>
        </div>
        </>
    </>
  );
}
