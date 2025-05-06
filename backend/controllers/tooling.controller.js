import Tooling from "../models/tooling.modal.js";
import mongoose from "mongoose";

// @desc    Acquire new tooling (via PV or M11)
// @route   POST /api/tooling/acquire
export const acquireTooling = async (req, res) => {
  try {
    const {
      designation,
      acquisitionType,
      acquisitionRef,
      acquisitionDate,
      originalQte,
      responsible,
      location,
      placement,
      type,
      direction,
      notes,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "designation",
      "acquisitionType",
      "acquisitionRef",
      "acquisitionDate",
      "originalQte",
      "responsible",
      "location",
      "placement",
      "type",
      "direction",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check if adding to existing tool
    if (acquisitionType === "PV") {
      const existingTool = await Tooling.findOne({
        designation,
        acquisitionType: "PV",
        "exits.exitRef": { $ne: acquisitionRef }, // Ensure not duplicate PV
      });

      if (existingTool) {
        // Add to existing tool
        existingTool.originalQte += originalQte;
        existingTool.currentQte += originalQte;

        // Add to history
        existingTool.history.push({
          eventType: "entry",
          reference: acquisitionRef,
          date: new Date(acquisitionDate),
          qteChange: originalQte,
          notes,
          performedBy: req.user?.id || "system",
        });

        await existingTool.save();
        return res.status(200).json(existingTool);
      }
    }

    // Create new tool entry
    const newTooling = new Tooling({
      designation,
      acquisitionType,
      acquisitionRef,
      acquisitionDate: new Date(acquisitionDate),
      originalQte,
      currentQte: originalQte,
      responsible: new mongoose.Types.ObjectId(responsible),
      location: new mongoose.Types.ObjectId(location),
      placement: new mongoose.Types.ObjectId(placement),
      type,
      direction,
      situation: "available",
      history: [
        {
          eventType: "entry",
          reference: acquisitionRef,
          date: new Date(acquisitionDate),
          qteChange: originalQte,
          notes,
          performedBy: req.user?.id || "system",
        },
      ],
    });

    await newTooling.save();
    res.status(201).json(newTooling);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: error.errors,
    });
  }
};

// @desc    Exit tooling (M11 only)
// @route   POST /api/tooling/:id/exit
export const exitTooling = async (req, res) => {
  try {
    const { id } = req.params;
    const { exitRef, exitDate, exitQte, exitReason, notes } = req.body;

    // Validate required fields
    if (!exitRef || !exitDate || !exitQte || !exitReason) {
      return res.status(400).json({
        error: "Exit reference, date, quantity and reason are required",
      });
    }

    if (exitQte <= 0) {
      return res.status(400).json({
        error: "Exit quantity must be greater than 0",
      });
    }

    // Find the tool
    const tool = await Tooling.findById(id);
    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }

    // Check available quantity
    if (exitQte > tool.currentQte) {
      return res.status(400).json({
        error: `Not enough stock. Available: ${tool.currentQte}`,
      });
    }

    // Add exit record
    tool.exits.push({
      exitRef,
      exitDate: new Date(exitDate),
      exitQte,
      exitReason,
    });

    // Update current quantity
    tool.currentQte -= exitQte;

    // Update situation
    if (tool.currentQte <= 0) {
      tool.situation = "unavailable";
    } else if (tool.currentQte < tool.originalQte) {
      tool.situation = "partial";
    }

    // Add to history
    tool.history.push({
      eventType: "exit",
      reference: exitRef,
      date: new Date(exitDate),
      qteChange: -exitQte,
      notes,
      performedBy: req.user?.id || "system",
    });

    await tool.save();
    res.status(200).json(tool);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Convert PV acquisition to M11
// @route   POST /api/tooling/:id/convert
export const convertPVtoM11 = async (req, res) => {
  try {
    const { id } = req.params;
    const { m11Ref, m11Date, notes } = req.body;

    if (!m11Ref || !m11Date) {
      return res.status(400).json({
        error: "M11 reference and date are required",
      });
    }

    const tool = await Tooling.findById(id);
    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }

    if (tool.acquisitionType !== "PV") {
      return res.status(400).json({
        error: "Only PV acquisitions can be converted",
      });
    }

    // Update acquisition info
    tool.acquisitionType = "M11";
    tool.acquisitionRef = m11Ref;
    tool.acquisitionDate = new Date(m11Date);

    // Add to history
    tool.history.push({
      eventType: "conversion",
      reference: m11Ref,
      date: new Date(m11Date),
      notes,
      performedBy: req.user?.id || "system",
    });

    await tool.save();
    res.status(200).json(tool);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all tooling records with filters
// @route   GET /api/tooling
export const getAllTooling = async (req, res) => {
  try {
    const { direction, type, situation } = req.query;
    const filter = {};

    if (direction) filter.direction = direction;
    if (type) filter.type = type;
    if (situation) filter.situation = situation;

    const tools = await Tooling.find(filter)
      .populate("responsible", "name")
      .populate("location", "name")
      .populate("placement", "name")
      .sort({ designation: 1 });

    res.status(200).json(tools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get tooling by ID with full details
// @route   GET /api/tooling/:id
export const getToolingById = async (req, res) => {
  try {
    const tool = await Tooling.findById(req.params.id)
      .populate("responsible", "name position")
      .populate("location", "name code")
      .populate("placement", "name section");

    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    res.status(200).json(tool);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get current stock level
// @route   GET /api/tooling/:id/stock
export const getToolStock = async (req, res) => {
  try {
    const tool = await Tooling.findById(req.params.id).select(
      "designation mat originalQte currentQte situation"
    );

    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }

    res.status(200).json({
      designation: tool.designation,
      mat: tool.mat,
      originalQuantity: tool.originalQte,
      currentQuantity: tool.currentQte,
      situation: tool.situation,
      exitsCount: tool.exits.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get full history of a tool
// @route   GET /api/tooling/:id/history
export const getToolHistory = async (req, res) => {
  try {
    const tool = await Tooling.findById(req.params.id)
      .select("history exits designation mat")
      .lean();

    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }

    // Only transform exits that aren't already in history
    const exitRecords = (tool.exits || [])
      .filter((exit) => !tool.history.some((h) => h.reference === exit.exitRef))
      .map((exit) => ({
        _id: exit._id,
        eventType: "exit",
        reference: exit.exitRef,
        date: exit.exitDate,
        qteChange: -exit.exitQte,
        notes: exit.exitReason,
        isExitRecord: true, // Flag to identify transformed exits
      }));

    const combined = [...(tool.history || []), ...exitRecords].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.json(combined);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update tooling details
// @route   PUT /api/tooling/:id
export const updateTooling = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      designation,
      responsible,
      location,
      placement,
      type,
      direction,
      notes,
    } = req.body;

    const updates = {};
    if (designation) updates.designation = designation;
    if (responsible)
      updates.responsible = new mongoose.Types.ObjectId(responsible);
    if (location) updates.location = new mongoose.Types.ObjectId(location);
    if (placement) updates.placement = new mongoose.Types.ObjectId(placement);
    if (type) updates.type = type;
    if (direction) updates.direction = direction;

    const updatedTool = await Tooling.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedTool) {
      return res.status(404).json({ error: "Tool not found" });
    }

    // Add to history if any updates
    if (Object.keys(updates).length > 0) {
      updatedTool.history.push({
        eventType: "adjustment",
        date: new Date(),
        notes: notes || "General information update",
        performedBy: req.user?.id || "system",
      });
      await updatedTool.save();
    }

    res.status(200).json(updatedTool);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete tooling (with history preservation)
// @route   DELETE /api/tooling/:id
export const deleteTooling = async (req, res) => {
  try {
    const tool = await Tooling.findByIdAndDelete(req.params.id);

    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    // In production, you might want to archive instead of delete
    res.status(200).json({
      message: "Tool deleted successfully",
      deletedTool: tool.designation,
      mat: tool.mat,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Additional utility controllers
export const getToolsByDirection = async (req, res) => {
  try {
    const tools = await Tooling.find({ direction: req.params.direction })
      .select("designation mat currentQte situation")
      .sort({ designation: 1 });
    res.status(200).json(tools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getToolsByType = async (req, res) => {
  try {
    const tools = await Tooling.find({ type: req.params.type })
      .select("designation mat direction currentQte")
      .sort({ designation: 1 });
    res.status(200).json(tools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
