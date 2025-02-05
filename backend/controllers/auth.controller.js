import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.modal.js";
import bcrypt from "bcryptjs";

// funtion signup
export const signup = async (req, res) => {
  try {
    const { username, email, password, grade } = req.body;
    //validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    //check if user or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res.status(400).json({
        error:
          existingUser.username === username
            ? "Username already exists"
            : "Email already exists",
      });
    }
    //validate password length
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }
    /// hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //create and save a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      grade,
    });
    await newUser.save();
    // generate token and set cookie
    generateTokenAndSetCookie(newUser._id, res);
    //send response
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      grade: newUser.grade,
      followers: newUser.followers,
      following: newUser.following,
      profileImg: newUser.profileImg,
    });
  } catch (error) {
    console.error("error in signup controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// funtion login
export const login = async (req, res) => {
  res.json({ message: "you hit the login endpoint" });
};
// funtion logout
export const logout = async (req, res) => {
  res.json({ message: "you hit the logout endpoint" });
};
