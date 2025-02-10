import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Role field to handle different types of users
    role: {
      type: String,
      enum: ["CC", "REPI", "RM", "FORM", "RLOG", "CAR", "REP"],
      default: "REPI",
      required: true,
    },
    // Optional field to record which admin created this user
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Email field for user identification and communication
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email address",
      ],
    },
    grade: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    profileImg: {
      type: String,
      default: "",
    },

    // New Fields
    phoneUsersCount: {
      type: Number,
      default: 0, // Initialize as 0
    },
    officeUsersCount: {
      type: Number,
      default: 0, // Initialize as 0
    },
    isOnline: {
      type: Boolean,
      default: false, // Default to offline
    },
    availability: {
      type: String,
      enum: ["available", "on vacation"],
      default: "available",
    },
    returnDate: {
      type: Date, // Stores when the user will return from vacation
      default: null,
    },
    alternativeUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to another user who will take their place
      default: null,
    },
    mission: {
      type: String, // Description of the user's mission
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
