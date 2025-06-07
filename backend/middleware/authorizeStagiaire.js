import User from "../models/user.modal.js";

export const authorizeStagiaire = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(403).json({ error: "Not authorized, no user found." });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(403).json({ error: "User not found." });
    }

    // Check if user is stagiaire
    if (user.role !== "STAG") {
      console.log(`Test access denied for role: ${user.role}`);
      return res.status(403).json({ 
        error: "Access denied. Only stagiaires can take tests." 
      });
    }

    next(); // Proceed if user is stagiaire
  } catch (error) {
    console.error("Error in authorizeStagiaire middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const authorizeStagiaireOrFormateur = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(403).json({ error: "Not authorized, no user found." });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(403).json({ error: "User not found." });
    }

    // Check if user is stagiaire or formateur (for viewing results)
    if (user.role !== "STAG" && user.role !== "FORM" && !user.isAdmin()) {
      console.log(`Access denied for role: ${user.role}`);
      return res.status(403).json({ 
        error: "Access denied. Stagiaires, formateurs and admins only." 
      });
    }

    next(); // Proceed if user is stagiaire, formateur, or admin
  } catch (error) {
    console.error("Error in authorizeStagiaireOrFormateur middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
