import Event from "../models/events.modal.js";
import notificationService from "../services/notificationService.js";

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
    const {
      title,
      start,
      end,
      description = "",
      location = "",
      status = "upcoming",
      priority = "medium",
      notifications = {
        oneDayBefore: true,
        oneHourBefore: true,
      },
    } = req.body;

    const newEvent = new Event({
      title,
      start,
      end,
      description,
      location,
      status,
      priority,
      createdBy: req.user._id,
      notifications: {
        oneDayBefore: notifications.oneDayBefore,
        oneHourBefore: notifications.oneHourBefore,
        sent: {
          oneDayBefore: false,
          oneHourBefore: false,
        },
      },
    });
    await newEvent.save(); // Save it in the database

    // Schedule notifications for this event
    await notificationService.scheduleEventNotifications(newEvent._id);

    res.status(201).json(newEvent); // Return saved event data
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save event" });
  }
};

// Update an event
export const updateEvent = async (req, res) => {
  try {
    const {
      title,
      start,
      end,
      description,
      location,
      status,
      priority,
      notifications,
    } = req.body;

    const updateData = {
      ...(title !== undefined && { title }),
      ...(start !== undefined && { start }),
      ...(end !== undefined && { end }),
      ...(description !== undefined && { description }),
      ...(location !== undefined && { location }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
    };

    // Handle notification preferences update
    if (notifications !== undefined) {
      updateData.notifications = {
        oneDayBefore: notifications.oneDayBefore,
        oneHourBefore: notifications.oneHourBefore,
        sent: {
          oneDayBefore: false, // Reset sent flags when updating
          oneHourBefore: false,
        },
      };
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Reschedule notifications if event time or notification preferences changed
    if (
      start !== undefined ||
      end !== undefined ||
      notifications !== undefined
    ) {
      await notificationService.scheduleEventNotifications(updatedEvent._id);
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

    // Cancel any pending notifications for this event
    await notificationService.cancelEventNotifications(req.params.id);

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete event" });
  }
};
