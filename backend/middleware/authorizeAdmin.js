import User from "../models/user.modal.js";

export const authorizeAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(403).json({ error: "Not authorized, no user found." });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(403).json({ error: "User nott found." });
    }

    if (user.role !== "REPI") {
      console.log(`Access denied for role: ${user.role}`);
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    next(); // Proceed if user is REPI
  } catch (error) {
    console.error("Error in authorizeAdmin middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
