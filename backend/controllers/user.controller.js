import User from "../models/user.modal.js";
import Task from "../models/task.modal.js";
import Notification from "../models/notification.modal.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { username, email, password, grade, role } = req.body;
    const adminId = req.user._id;

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

    //check if email already exists
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
    //create and save a new user modifying req.user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      grade,
      role,
      createdBy: adminId,
      createdAt: new Date(),
    });
    await newUser.save();
    // Do NOT generate a new token for the new user (keep the original REPI logged in)
    res.status(201).json({
      message: "User created successfully",
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      grade: newUser.grade,
      createdBy: newUser.createdBy,
      createdAt: newUser.createdAt,
      isOnline: newUser.isOnline,
    });
  } catch (error) {
    console.error("error in signup controller", error.message);

    res.status(500).json({ error: "Internal" });
  }
};
//getuserProfile
export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");

    if (!user) return res.status(404).json({ error: "User not founddd" });
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateUser = async (req, res) => {
  const {
    username,
    email,
    currentPassword,
    newPassword,
    grade,
    role,
    mission,
    phoneUsersCount,
    officeUsersCount,
    availability,
    returnDate,
    alternativeUser,
  } = req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;
    user.email = email || user.email;
    user.username = username || user.username;
    user.grade = grade || user.grade;
    user.role = role || user.role;
    user.mission = mission || user.mission;
    user.phoneUsersCount = phoneUsersCount || user.phoneUsersCount;
    user.officeUsersCount = officeUsersCount || user.officeUsersCount;
    user.availability = availability || user.availability;
    user.returnDate = returnDate || user.returnDate;
    user.alternativeUser = alternativeUser || user.alternativeUser;

    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    // password should be null in response
    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const usersFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    // 1,2,3,4,5,6,
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = await User.find({ isOnline: true }).select("-password");
    res.status(200).json(onlineUsers);
  } catch (error) {
    console.error("Error in getOnlineUsers:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const followUnFollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow yourself" });
    }

    if (!userToModify || !currentUser)
      return res.status(404).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      //unfollow the user
      await User.findByIdAndUpdate(id, {
        $pull: { followers: req.user._id },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { following: id },
      });
      //to do return the id of the user as a response
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      //follow the user
      await User.findByIdAndUpdate(id, {
        $push: { followers: req.user._id },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: { following: id },
      });

      // Send notification to the user
      const notification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });
      await notification.save();
      //to do return the id of the user as a response
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnFollowUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

//getUserCount
export const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error in getUserCount controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default to page 1
    const limit = parseInt(req.query.limit) || 10; // default to 10 users per page
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select(
        "-password -createdBy -updatedAt -followers -following -isOnline -returnDate -mission -profileImg -coverImg -createdAt"
      )
      .skip(skip)
      .limit(limit)
      .lean(); // lean() improves performance by returning plain JS objects

    // Ensure availability is always present and boolean for frontend
    const usersWithAvailability = users.map((user) => ({
      ...user,
      availability: user.availability === "available",
    }));

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      page,
      limit,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      users: usersWithAvailability,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUsersTasks = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Excludes passwords for security
    //add tasks to each user
    const userwithTaskCounts = await Promise.all(
      users.map(async (user) => {
        const pendingTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "pending", // fixed: lowercase
        });
        const inProgressTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "inprogress", // fixed: lowercase, one word
        });
        const completedTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "done", // already correct
        });
        return {
          ...user._doc,
          pendingTasks,
          inProgressTasks,
          completedTasks,
        };
      })
    );
    res.status(200).json(userwithTaskCounts);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getUserTaskById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // Excludes passwords for security
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserStats = async (req, res) => {
  try {
    // Get total user count
    const totalUsers = await User.countDocuments();

    // Get online users count
    const onlineUsers = await User.countDocuments({ isOnline: true });

    // Get available users count
    const availableUsers = await User.countDocuments({
      availability: "available",
    });

    // Get users by role
    const roleStats = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get users by grade (using grade as location/department)
    const gradeStats = await User.aggregate([
      { $group: { _id: "$grade", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        onlineUsers,
        availableUsers,
        roleDistribution: roleStats,
        gradeDistribution: gradeStats,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
