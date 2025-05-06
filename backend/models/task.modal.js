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
    attchments: [{ type: String }],
    todocheklist: [todoSchema],
    progrss: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);
const Task = mongoose.model("Task", taskSchema);
export const Todo = mongoose.model("Todo", todoSchema);

export default Task;
