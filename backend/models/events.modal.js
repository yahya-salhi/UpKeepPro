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
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
