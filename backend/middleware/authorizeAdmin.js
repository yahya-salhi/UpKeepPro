import User from "../models/user.modal.js";

export const authorizeAdmin = async (req, res, next) => {
  try {
    // Access the user object from req.user set in the protect middleware
    const user = await User.findById(req.user._id); // Change req.userId to req.user._id

    if (!user || user.role !== "REPI") {
      console.log(user ? user.role : "No user found"); // More precise debug logging
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error in authorizeAdmin middleware:", error); // More detailed logging
    res.status(500).json({ error: "Internal server error" });
  }
};
