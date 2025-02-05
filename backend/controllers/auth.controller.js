import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.modal.js";
import bcrypt from "bcryptjs";

// funtion signup
export const signup = async (req, res) => {
  try {
    const { username, email, password, grade, role } = req.body;
    const adminId = req.user._id;
    // console.log("adminId", adminId);
    // console.log("req.userId", req.user._id);

    //validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    // Check if admin exists and has REPI role
    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== "REPI") {
      return res
        .status(403)
        .json({ error: "Only REPI admins can create users" });
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
      role,
      createdBy: adminId,
    });

    if (newUser) {
      //send response
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        message: "User created successfully",
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      });
    } else {
      res.status(400).json({ error: "User not created" });
    }
  } catch (error) {
    console.error("error in signup controller", error.message);

    res.status(500).json({ error: "Internal" });
  }
};

// funtion login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid Email" });
    }

    const isMatch = await bcrypt.compare(password, user?.password || "");
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid Password" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      message: "Login successful",
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Error in login controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// funtion logout
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
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
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
