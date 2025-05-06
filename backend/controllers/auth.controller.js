import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.modal.js";
import bcrypt from "bcryptjs";

// funtion login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid Email" });
    }
    //compare password
    const isMatch = await bcrypt.compare(password, user?.password || "");
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid Password" });
    }
    //update isOnline status
    user.isOnline = true;
    await user.save();
    //generate token and set cookie
    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      message: "Login successful",
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      grade: user.grade,
      createdBy: user.createdBy,
      createdAt: user.createdAt,
      isOnline: user.isOnline,
    });
  } catch (error) {
    console.error("Error in login controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// funtion logout
export const logout = async (req, res) => {
  try {
    // Get user from the request
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user found" });
    }

    // Update isOnline status to false
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isOnline: false },
      { new: true }
    );
    // console.log("Updated user after logout:", updatedUser);
    // Clear JWT cookie
    // Clear JWT cookie properly
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

//getMe
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const isAdmin = user.isAdmin(); // Call the isAdmin method

    res.status(200).json({ ...user.toObject(), isAdmin });
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
