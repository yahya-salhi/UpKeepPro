import Event from "../models/events.modal.js";

// Fetch all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find(); // Fetch all events from the database
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

// Fetch a single event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id); // Find event by ID
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
};

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const newEvent = new Event(req.body); // Create new event with request data
    await newEvent.save(); // Save it in the database
    res.status(201).json(newEvent); // Return saved event data
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save event" });
  }
};

// Update an event
export const updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated event
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update event" });
  }
};

// Delete an event
export const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete event" });
  }
};
