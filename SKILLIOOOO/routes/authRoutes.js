import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model("User", userSchema);

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });
    
    user = await User.create({ name, email, password });
    res.json({ message: "Registered successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    
    // Auto-register any new user directly from the login screen
    if (!user) {
      user = await User.create({ name: email.split('@')[0], email, password: password || 'oauth_mock_password' });
    } else if (password && user.password !== password && user.password !== 'oauth_mock_password') {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    res.json({ message: "Logged in", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5011;
app.listen(PORT, () => {
  console.log(`🔐 Auth Server running at http://localhost:${PORT}`);
});
