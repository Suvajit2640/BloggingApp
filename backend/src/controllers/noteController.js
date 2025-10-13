import noteSchema from "../models/noteSchema.js";
import dbconnect from "../config/dbConnection.js";

// Creating note
export const createNote = async (req, res) => {
  try {
    await dbconnect();

    const userId = req.userId;
    const { title, content } = req.body;

    const existing = await noteSchema.findOne({
      title: title,
      userId: userId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This title already exists",
      });
    }

    const note = await noteSchema.create({
      title,
      content,
      userId: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return res.status(201).json({
      success: true,
      data: note,
      message: "Note created successfully",
    });

  } catch (error) {
    console.error("Create note error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error in note creation",
    });
  }
};

// Get all notes for a user
export const getNote = async (req, res) => {
  try {
    await dbconnect();

    const userId = req.userId;
    const notes = await noteSchema.find({ userId: userId });

    return res.status(200).json({
      success: true,
      data: notes,
      count: notes.length,
      message: "Notes fetched successfully",
    });

  } catch (error) {
    console.error("Get notes error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Data fetching failed",
    });
  }
};

// Update note
export const updateNote = async (req, res) => {
  try {
    await dbconnect();

    const _id = req.params.id;
    const { title, content } = req.body;

    const existing = await noteSchema.findOne({
      title: title,
      userId: req.userId,
      _id: { $ne: _id },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This title already exists",
      });
    }

    const updated_result = await noteSchema.findByIdAndUpdate(
      _id,
      {
        title: title,
        content: content,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!updated_result) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updated_result,
      message: "Note updated successfully",
    });

  } catch (error) {
    console.error("Update note error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Note update failed",
    });
  }
};

// Delete note
export const deleteNote = async (req, res) => {
  try {
    await dbconnect();

    const id = req.params.id;
    const note = await noteSchema.findByIdAndDelete(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
      data: note,
    });

  } catch (error) {
    console.error("Delete note error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Note deletion failed",
    });
  }
};

// Get all notes with pagination, sorting, and search
export const getAllNote = async (req, res) => {
  try {
    await dbconnect();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const searchTitle = req.body.title || '';

    const sortCriteria = { [sortField]: sortOrder };
    const offset = (page - 1) * limit;

    const query = {
      userId: req.userId,
      title: { $regex: searchTitle, $options: "i" },
    };

    const data = await noteSchema
      .find(query)
      .skip(offset)
      .limit(limit)
      .sort(sortCriteria)
      .exec();

    const total = await noteSchema.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: data,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit),
      },
      message: "Notes fetched successfully",
    });

  } catch (error) {
    console.error("Get all notes error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Data fetching failed",
    });
  }
};

// Search notes
export const searchNote = async (req, res) => {
  try {
    await dbconnect();

    const searchTitle = req.body.title || '';
    
    const notes = await noteSchema.find({
      userId: req.userId,
      title: { $regex: searchTitle, $options: "i" },
    });

    if (notes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No notes found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notes found",
      data: notes,
      count: notes.length,
    });

  } catch (error) {
    console.error("Search notes error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Search failed",
    });
  }
};

// Sort notes
export const sortNotes = async (req, res) => {
  try {
    await dbconnect();

    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    const sortCriteria = { [sortField]: sortOrder };
    
    const sortedDocuments = await noteSchema
      .find({ userId: req.userId })
      .sort(sortCriteria);

    if (sortedDocuments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No notes found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notes sorted successfully",
      data: sortedDocuments,
      count: sortedDocuments.length,
    });

  } catch (error) {
    console.error("Sort notes error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Sorting failed",
    });
  }
};

// Pagination
export const getUsersOffset = async (req, res) => {
  try {
    await dbconnect();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const data = await noteSchema
      .find({ userId: req.userId })
      .skip(offset)
      .limit(limit)
      .exec();

    const total = await noteSchema.countDocuments({ userId: req.userId });

    return res.status(200).json({
      success: true,
      data: data,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit),
      },
      message: "Notes fetched successfully",
    });

  } catch (error) {
    console.error("Pagination error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Pagination failed",
    });
  }
};