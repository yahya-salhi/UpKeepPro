import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
    status: {
      type: String,
      enum: ["pending", "inprogress", "done"],
      default: "pending",
    },
    dueDate: { type: Date, required: true },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attchments: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        size: { type: Number, required: true },
        data: { type: String, required: true }, // Base64 encoded file data
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    userSubmissions: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        size: { type: Number, required: true },
        data: { type: String, required: true }, // Base64 encoded file data
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    todocheklist: [todoSchema],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      validate: {
        validator: Number.isInteger,
        message: "Progress must be an integer between 0 and 100",
      },
    },
  },
  {
    timestamps: true,
  }
);
const Task = mongoose.model("Task", taskSchema);
export const Todo = mongoose.model("Todo", todoSchema);

export default Task;
