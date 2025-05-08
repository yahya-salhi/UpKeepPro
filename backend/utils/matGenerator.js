import mongoose from "mongoose";

// This function returns an existing MAT for a designation or generates a new one
export async function getOrCreateMAT(designation) {
  const Tooling = mongoose.model("Tooling");
  const prefix = designation.substring(0, 2).toUpperCase();

  // Check if a tool with the same designation already exists
  const existing = await Tooling.findOne({
    designation: new RegExp(`^${designation}$`, "i"),
  }).select("mat");
  if (existing?.mat) return existing.mat;

  // If not, generate a new MAT
  const highest = await Tooling.findOne({
    mat: new RegExp(`^${prefix}\\d{3}$`),
  })
    .sort({ mat: -1 })
    .select("mat")
    .lean();

  const nextNumber = highest ? parseInt(highest.mat.slice(-3)) + 1 : 1;
  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}
