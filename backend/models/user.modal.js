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
    // Additional email field for user identification and communication
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
      // You can add a match validator for email pattern if needed:
      // match: [/.+\@.+\..+/, 'Please fill a valid email address'],
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
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);

export default User;
