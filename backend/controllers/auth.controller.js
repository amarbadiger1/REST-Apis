import { z } from "zod";
import bcrypt from "bcryptjs";
import userModel from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

const signup = async (req, res) => {
  // Zod validatoin Schema for signup
  const signupSchema = z.object({
    username: z.string().min(3).max(30),
    fullName: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
  });
  try {
    // Validate input data
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .send({ success: false, message: "Input Validation Failed" });
    }

    const { username, fullName, email, password } = req.body;

    // Check if the username already exists
    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .send({ success: false, message: "The username already taken" });
    }

    // Check if the email already exists
    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .send({ success: false, message: "The Email already taken" });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create user
    const newUser = new userModel({
      username,
      fullName,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      //Generate token
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      const userResponse = {
        _id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      };
      res.status(201).send({
        success: true,
        message: "User Created successfully",
        user: userResponse,
      });
    } else {
      res.status(400).send({ success: false, message: "Invaild input data" });
    }
  } catch (error) {
    console.log("Error during signup:", error.message);
    return res.status(500).send({
      success: false,
      message: "Server error. Please try again later",
    });
  }
};
const login = async (req, res) => {
  try {
    const loginSchema = z.object({
      username: z.string().min(3).max(30),
      password: z.string().min(8),
    });

    const validationResult = loginSchema.safeParse(req.body);
    //Input validation
    if (!validationResult.success) {
      return res
        .status(400)
        .send({ success: false, message: "Input validation failed" });
    }
    const { username, password } = req.body;

    const user = await userModel.findOne({ username });
    const ispasswordcorrect = await bcrypt.compare(
      password,
      user?.password || " "
    );
    if (!user || !ispasswordcorrect) {
      return res
        .status(400)
        .send({ success: false, message: "Invaild username or password" });
    }

    generateTokenAndSetCookie(user._id, res);
    const userResponse = {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    };
    res.status(200).send({
      success: true,
      message: "Login successfully",
      user: userResponse,
    });
  } catch (error) {
    console.log("Error during Login:", error.message);
    return res.status(500).send({
      success: false,
      message: "Server error. Please try again later",
    });
  }
};
const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).send({ success: true, message: "Sucessfully logout" });
  } catch (error) {
    console.log("error during logout", error.message);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

const getme = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    res.status(200).send({ user });
  } catch (error) {
    console.log("error In Get Me Controller", error.message);
    return res.status(500).send({ message: "Server error " });
  }
};

export { signup, login, logout, getme };
