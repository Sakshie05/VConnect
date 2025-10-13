import { User } from "../models/UserModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/MeetingModel.js";

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please provide your credentials" });
  }

  try {
    const findUser = await User.findOne({ username });
    if (!findUser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const isPassword = await bcrypt.compare(password, findUser.password);
    if (!isPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    findUser.token = token;
    await findUser.save();

    return res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: findUser._id,
        name: findUser.name,
        username: findUser.username,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const register = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });

    await newUser.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserHistory = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token: token });
    const meetings = await Meeting.find({ userId: user.username });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const addToHistory = async (req, res) => {
  const { token, meetingCode } = req.body;

  try {
    const user = await User.findOne({ token: token });

    const newMeeting = new Meeting({
      userId: user.username,
      meetingCode: meetingCode,
    });

    await newMeeting.save();
    res.status(200).json({ message: "Added meeting to History" });
    
  } catch (err) {
    res.status(500).json({ message: "Error adding to History" });
  }
};
