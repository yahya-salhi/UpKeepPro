import Placement from "../models/placement.modal.js";
// Create a new placement
export const createPlacement = async (req, res) => {
  try {
    const placement = new Placement(req.body);
    const savedPlacement = await placement.save();
    res.status(201).json(savedPlacement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all placements
export const getAllPlacements = async (req, res) => {
  try {
    const placements = await Placement.find();
    res.status(200).json(placements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
