import cron from "node-cron";
import Event from "../models/events.modal.js";
import Notification from "../models/notification.modal.js";
import User from "../models/user.modal.js";
import { io } from "../lib/socket.js";

class NotificationService {
  constructor() {
    this.scheduledJobs = new Map();
    this.initializeCronJobs();
  }

  // Initialize cron jobs that run periodically to check for notifications
  initializeCronJobs() {
    // Run every 15 minutes to check for notifications
    cron.schedule("*/15 * * * *", () => {
      this.checkAndSendNotifications();
    });

    console.log(
      "Notification service initialized with cron jobs (running every 15 minutes)"
    );
  }

  // Main method to check and send notifications
  async checkAndSendNotifications() {
    try {
      const now = new Date();

      // Calculate time windows for notifications
      const twentyFourHoursFromNow = new Date(
        now.getTime() + 24 * 60 * 60 * 1000
      ); // 24 hours
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

      // Send 24-hour notifications for events starting in the next 24 hours
      await this.send24HourNotifications(now, twentyFourHoursFromNow);

      // Send 1-hour notifications for events starting in the next hour
      await this.send1HourNotifications(now, oneHourFromNow);
    } catch (error) {
      console.error("Error in checkAndSendNotifications:", error);
    }
  }

  // Send 24-hour before notifications
  async send24HourNotifications(_, twentyFourHoursFromNow) {
    try {
      // Find events that start exactly 24 hours from now (within a 15-minute window)
      const twentyFourHoursAgo = new Date(
        twentyFourHoursFromNow.getTime() - 15 * 60 * 1000
      ); // 15 minutes before
      const twentyFourHoursAhead = new Date(
        twentyFourHoursFromNow.getTime() + 15 * 60 * 1000
      ); // 15 minutes after

      const events = await Event.find({
        start: {
          $gte: twentyFourHoursAgo,
          $lte: twentyFourHoursAhead,
        },
        "notifications.oneDayBefore": true,
        "notifications.sent.oneDayBefore": false,
        status: "upcoming",
      }).populate("createdBy", "username email");

      for (const event of events) {
        await this.createAndSendNotification(
          event,
          "event_reminder_1day",
          `Reminder: "${
            event.title
          }" starts in 24 hours at ${this.formatEventTime(event)}`
        );

        // Mark as sent
        await Event.findByIdAndUpdate(event._id, {
          "notifications.sent.oneDayBefore": true,
        });
      }
    } catch (error) {
      console.error("Error sending 24-hour notifications:", error);
    }
  }

  // Send 1-hour before notifications
  async send1HourNotifications(_, oneHourFromNow) {
    try {
      // Find events that start exactly 1 hour from now (within a 15-minute window)
      const oneHourAgo = new Date(oneHourFromNow.getTime() - 15 * 60 * 1000); // 15 minutes before
      const oneHourAhead = new Date(oneHourFromNow.getTime() + 15 * 60 * 1000); // 15 minutes after

      const events = await Event.find({
        start: {
          $gte: oneHourAgo,
          $lte: oneHourAhead,
        },
        "notifications.oneHourBefore": true,
        "notifications.sent.oneHourBefore": false,
        status: "upcoming",
      }).populate("createdBy", "username email");

      for (const event of events) {
        await this.createAndSendNotification(
          event,
          "event_reminder_1hour",
          `Reminder: "${
            event.title
          }" starts in 1 hour at ${this.formatEventTime(event)}`
        );

        // Mark as sent
        await Event.findByIdAndUpdate(event._id, {
          "notifications.sent.oneHourBefore": true,
        });
      }
    } catch (error) {
      console.error("Error sending 1-hour notifications:", error);
    }
  }

  // Create and send notification
  async createAndSendNotification(event, type, message) {
    try {
      // Create notification in database
      const notification = await Notification.create({
        from: event.createdBy._id,
        to: event.createdBy._id,
        type: type,
        eventId: event._id,
        message: message,
        read: false,
      });

      // Populate the notification for real-time sending
      const populatedNotification = await Notification.findById(
        notification._id
      )
        .populate("from", "username profileImg")
        .populate("eventId", "title start end location");

      // Send real-time notification via socket
      if (io) {
        io.to(event.createdBy._id.toString()).emit("newEventNotification", {
          notification: populatedNotification,
          event: event,
        });
      }
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  }

  // Format event time for display
  formatEventTime(event) {
    const startTime = new Date(event.start);
    return startTime.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Schedule notifications when an event is created or updated
  async scheduleEventNotifications(eventId) {
    try {
      const event = await Event.findById(eventId).populate("createdBy");
      if (!event) return;

      // Reset sent flags if event time changed
      await Event.findByIdAndUpdate(eventId, {
        "notifications.sent.oneDayBefore": false,
        "notifications.sent.oneHourBefore": false,
      });
    } catch (error) {
      console.error("Error scheduling event notifications:", error);
    }
  }

  // Cancel notifications for a deleted event
  async cancelEventNotifications(eventId) {
    try {
      // Remove any pending notifications for this event
      await Notification.deleteMany({
        eventId: eventId,
        read: false,
      });

      console.log(`Cancelled notifications for event: ${eventId}`);
    } catch (error) {
      console.error("Error cancelling event notifications:", error);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
