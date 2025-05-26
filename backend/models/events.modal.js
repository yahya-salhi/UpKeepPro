import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  description: { type: String, default: "" },
  location: { type: String, default: "" },
  status: {
    type: String,
    enum: ["upcoming", "completed", "in progress"],
    default: "upcoming",
  },
  priority: {
    type: String,
    enum: ["high", "medium", "low"],
    default: "medium",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  notifications: {
    oneDayBefore: {
      type: Boolean,
      default: true,
    },
    oneHourBefore: {
      type: Boolean,
      default: true,
    },
    sent: {
      oneDayBefore: {
        type: Boolean,
        default: false,
      },
      oneHourBefore: {
        type: Boolean,
        default: false,
      },
    },
  },
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
