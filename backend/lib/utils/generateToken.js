import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  // Setting the JWT token in cookies
  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in ms
    httpOnly: true, // Prevents XSS attacks
    sameSite: "strict", //csfr attacks
    secure: process.env.NODE_ENV === "production", // Secure cookie only in production
  });

  return token;
};
