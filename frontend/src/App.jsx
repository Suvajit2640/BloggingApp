import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import { Register } from "./pages/Register";
import { VerifyPage } from "./pages/VerifyPage";
import { Login } from "./pages/Login";
import { NotesPage } from "./pages/NotesPage";
import { UserContext } from "./context/UserContext";
import { useState } from "react";

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
          <Route path="/verify/token" element={<VerifyPage  />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Notes" element={<NotesPage />} />
          <Route path="/createNote" element={<ManipulateNote />} />
          <Route path="/NoteCard" element={NoteCard}></Route>
        </Routes>
      </UserContext.Provider>

    </>
  );
}

export default App;
