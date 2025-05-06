import mongoose from "mongoose";

const placementSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  description: { type: String },
});

const Placement = mongoose.model("Placement", placementSchema);

export default Placement;
