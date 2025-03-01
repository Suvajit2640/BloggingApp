import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  createdAt: { type: Date, required: true, default: null },
  
  updatedAt: { type: Date, required: true, default: null },
});

export default mongoose.model("notesdb", noteSchema);
