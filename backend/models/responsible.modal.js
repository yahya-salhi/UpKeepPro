import mongoose from "mongoose";
const responsibleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  grade: {
    type: String,
    required: true,
  },
});

const Responsible = mongoose.model("Responsible", responsibleSchema);
export default Responsible;
