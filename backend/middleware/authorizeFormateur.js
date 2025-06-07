import User from "../models/user.modal.js";

export const authorizeFormateur = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(403).json({ error: "Not authorized, no user found." });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(403).json({ error: "User not found." });
    }

    // Check if user is formateur or admin
    if (user.role !== "FORM" && !user.isAdmin()) {
      console.log(`Access denied for role: ${user.role}`);
      return res.status(403).json({ 
        error: "Access denied. Formateurs and Admins only." 
      });
    }

    next(); // Proceed if user is formateur or admin
  } catch (error) {
    console.error("Error in authorizeFormateur middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const authorizeFormateurOnly = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(403).json({ error: "Not authorized, no user found." });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(403).json({ error: "User not found." });
    }

    // Check if user is formateur only
    if (user.role !== "FORM") {
      console.log(`Access denied for role: ${user.role}`);
      return res.status(403).json({ 
        error: "Access denied. Formateurs only." 
      });
    }

    next(); // Proceed if user is formateur
  } catch (error) {
    console.error("Error in authorizeFormateurOnly middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
