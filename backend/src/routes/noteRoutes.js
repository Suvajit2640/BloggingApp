import express from "express";
import { decodeToken } from "../middleware/decodetoken.js";
import { createNote, deleteNote, fileUpload, getAllNote, getNote, getUsersOffset, searchNote, sortNotes, updateNote, upload } from "../controllers/noteController.js";
import { isLoggedIn } from "../middleware/isloggedin.js";
import { notesvalidation } from "../validators/dataValidation.js";
import { validate } from "../middleware/validate.js";

const noteRoute = express.Router();

noteRoute.post("/create",validate(notesvalidation),decodeToken,isLoggedIn,createNote)
noteRoute.get("/get",decodeToken,isLoggedIn,getNote)
noteRoute.put("/update/:id",validate(notesvalidation),decodeToken,isLoggedIn,updateNote)
noteRoute.delete("/delete/:id",decodeToken,isLoggedIn,deleteNote)
noteRoute.post("/search",decodeToken,isLoggedIn,searchNote) 
noteRoute.get("/sort",decodeToken,isLoggedIn,sortNotes)
noteRoute.get("/getuseroffset",decodeToken,isLoggedIn,getUsersOffset)
noteRoute.post("/fileupload",decodeToken,isLoggedIn,upload.single("file"),fileUpload)
noteRoute.post("/getAllnote",decodeToken,isLoggedIn,getAllNote)

export default noteRoute;