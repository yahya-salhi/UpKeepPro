import Location from "../models/location.modal.js";

// Create a new location
export const createLocation = async (req, res) => {
  try {
    const location = new Location(req.body);
    const savedLocation = await location.save();
    res.status(201).json(savedLocation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all locations
export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
