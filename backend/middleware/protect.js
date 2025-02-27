import jwt from "jsonwebtoken";
import User from "../models/user.modal.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized: Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    console.log("User found:", user); // Log the user

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // Add user to the request object
    next();
  } catch (error) {
    console.log("Error in protect middleware:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
