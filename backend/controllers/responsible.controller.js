import Responsible from "../models/responsible.modal.js";
// Create a new responsible person
export const createResponsible = async (req, res) => {
  try {
    const responsible = new Responsible(req.body);
    const savedResponsible = await responsible.save();
    res.status(201).json(savedResponsible);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all responsible persons
export const getAllResponsibles = async (req, res) => {
  try {
    const responsibles = await Responsible.find();
    res.status(200).json(responsibles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
