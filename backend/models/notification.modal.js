import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "follow",
        "like",
        "event_reminder_1day",
        "event_reminder_1hour",
        "file_submission",
        "task_assignment",
        "task_update",
        "task_completion",
        "task_edited",
      ],
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: function () {
        return (
          this.type === "event_reminder_1day" ||
          this.type === "event_reminder_1hour"
        );
      },
    },
    message: {
      type: String,
      required: function () {
        return (
          this.type === "event_reminder_1day" ||
          this.type === "event_reminder_1hour" ||
          this.type === "file_submission" ||
          this.type === "task_assignment" ||
          this.type === "task_update" ||
          this.type === "task_completion" ||
          this.type === "task_edited"
        );
      },
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false, // track if the notification has been read
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
