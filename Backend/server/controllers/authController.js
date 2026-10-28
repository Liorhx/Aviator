import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/Models.js";

const getJwtSecret = () => process.env.JWT_SECRET || "default_secret";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCount = await User.countDocuments();
    // Allow the specific user email to be an admin, or the first user
    const role = (userCount === 0 || email === "rahulyadav0000063@gmail.com") ? "admin" : "user";
    const user = await User.create({ username, email, password: hashedPassword, role });
    const userObj = user;

    const token = jwt.sign({ id: userObj._id, username: userObj.username, role: userObj.role }, getJwtSecret());
    res.status(201).json({ token, user: { id: userObj._id, username: userObj.username, balance: userObj.balance, role: userObj.role } });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Force admin role for the owner email if not already set
    if (user.email === "rahulyadav0000063@gmail.com" && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, getJwtSecret());
    res.json({ token, user: { id: user._id, username: user.username, balance: user.balance, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username email balance role');
    res.json({ id: user?._id, username: user?.username, email: user?.email, balance: user?.balance, role: user?.role });
  } catch (error) {
    res.status(500).json({ message: "Profile fetch failed", error });
  }
};
