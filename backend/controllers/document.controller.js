import Document from "../models/document.modal.js";
import mongoose from "mongoose";

// @desc    Create new document
// @route   POST /api/documents
export const createDocument = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const requiredFields = ["title", "content", "category"];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const document = await Document.create({
      ...req.body,
      createdBy: req.user._id,
      lastModified: {
        timestamp: new Date(),
        by: req.user._id,
      },
    });

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all documents with filters
// @route   GET /api/documents
export const getAllDocuments = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;

    // Add permission check
    filter.$or = [
      { createdBy: req.user._id },
      { "permissions.user": req.user._id },
    ];

    const documents = await Document.find(filter)
      .populate("createdBy", "name email")
      .populate("lastModified.by", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get document by ID
// @route   GET /api/documents/:id
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("lastModified.by", "name email")
      .populate("permissions.user", "name email");

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check if user has permission to view
    const hasPermission = 
      document.createdBy._id.toString() === req.user._id.toString() ||
      document.permissions.some(p => p.user._id.toString() === req.user._id.toString());

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this document",
      });
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update document
// @route   PUT /api/documents/:id
export const updateDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check if user has permission to edit
    const hasPermission = 
      document.createdBy.toString() === req.user._id.toString() ||
      document.permissions.some(p => 
        p.user.toString() === req.user._id.toString() && 
        ["write", "admin"].includes(p.access)
      );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this document",
      });
    }

    // Update lastModified
    req.body.lastModified = {
      timestamp: new Date(),
      by: req.user._id,
    };

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: updatedDocument,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Only creator or admin can delete
    if (
      document.createdBy.toString() !== req.user._id.toString() &&
      !document.permissions.some(p => 
        p.user.toString() === req.user._id.toString() && 
        p.access === "admin"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this document",
      });
    }

    await document.remove();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get document version history
// @route   GET /api/documents/:id/history
export const getDocumentHistory = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .select("previousVersions")
      .populate("previousVersions.modifiedBy", "name email");

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      data: document.previousVersions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Share document with other users
// @route   POST /api/documents/:id/share
export const shareDocument = async (req, res) => {
  try {
    const { userId, access } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Only creator or admin can share
    if (
      document.createdBy.toString() !== req.user._id.toString() &&
      !document.permissions.some(p => 
        p.user.toString() === req.user._id.toString() && 
        p.access === "admin"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to share this document",
      });
    }

    // Update or add permission
    const permissionIndex = document.permissions.findIndex(
      p => p.user.toString() === userId
    );

    if (permissionIndex > -1) {
      document.permissions[permissionIndex].access = access;
    } else {
      document.permissions.push({ user: userId, access });
    }

    await document.save();

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get documents by category
// @route   GET /api/documents/category/:category
export const getDocumentsByCategory = async (req, res) => {
  try {
    const documents = await Document.find({
      category: req.params.category,
      $or: [
        { createdBy: req.user._id },
        { "permissions.user": req.user._id },
      ],
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Search documents
// @route   GET /api/documents/search
export const searchDocuments = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const documents = await Document.find({
      $and: [
        { $text: { $search: query } },
        {
          $or: [
            { createdBy: req.user._id },
            { "permissions.user": req.user._id },
          ],
        },
      ],
    })
      .populate("createdBy", "name email")
      .sort({ score: { $meta: "textScore" } });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Archive document
// @route   PUT /api/documents/:id/archive
export const archiveDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check permissions
    if (
      document.createdBy.toString() !== req.user._id.toString() &&
      !document.permissions.some(p => 
        p.user.toString() === req.user._id.toString() && 
        ["write", "admin"].includes(p.access)
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to archive this document",
      });
    }

    document.status = "archived";
    document.lastModified = {
      timestamp: new Date(),
      by: req.user._id,
    };

    await document.save();

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Publish document
// @route   PUT /api/documents/:id/publish
export const publishDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check permissions
    if (
      document.createdBy.toString() !== req.user._id.toString() &&
      !document.permissions.some(p => 
        p.user.toString() === req.user._id.toString() && 
        ["write", "admin"].includes(p.access)
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to publish this document",
      });
    }

    document.status = "published";
    document.lastModified = {
      timestamp: new Date(),
      by: req.user._id,
    };

    await document.save();

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
