import Event from "../models/events.modal.js";
import notificationService from "../services/notificationService.js";

// Fetch all events for the authenticated user
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id }); // Fetch only user's events
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

// Fetch a single event by ID (only if owned by the user)
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }); // Find event by ID and verify ownership

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found or access denied" });
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

// Update an event (only if owned by the user)
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

    // First, verify the event exists and belongs to the user
    const existingEvent = await Event.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!existingEvent) {
      return res
        .status(404)
        .json({ message: "Event not found or access denied" });
    }

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

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      updateData,
      { new: true }
    );

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

// Delete an event (only if owned by the user)
export const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!deletedEvent) {
      return res
        .status(404)
        .json({ message: "Event not found or access denied" });
    }

    // Cancel any pending notifications for this event
    await notificationService.cancelEventNotifications(req.params.id);

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete event" });
  }
};
