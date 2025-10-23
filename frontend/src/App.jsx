import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import { Register } from "./pages/Register";
import { VerifyPage } from "./pages/VerifyPage";
import { Login } from "./pages/Login";
import { NotesPage } from "./pages/NotesPage";
import { UserContext } from "./context/UserContext";
import { useState } from "react";
import { ForgetPassword } from "./pages/ForgetPassword";
import { OtpVerify } from "./pages/OtpVerify";
import { ResetPassword } from "./pages/ResetPassword";

import { NoteCard } from "./components/NoteCard";
import { ManipulateNote } from "./components/ManipulateNote";

function App() {
  const [isLogin, setIsLogin] = useState();
  return (
    <>

      <UserContext.Provider value={{ isLogin, setIsLogin }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/LandingPage" element={<LandingPage />} />
          <Route path="/Register" element={<Register />} />
          {/* <Route path="/verify/test" element={<VerifyPage  />} /> */}
          <Route path="/verify/:token" element={<VerifyPage />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Notes" element={<NotesPage />} />
          <Route path="/createNote" element={<ManipulateNote />} />
          <Route path="/NoteCard" element={NoteCard}></Route>
          <Route path="/ForgetPassword" element={<ForgetPassword />} />
          <Route path="/verify-otp" element={<OtpVerify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </UserContext.Provider>

    </>
  );
}

export default App;
