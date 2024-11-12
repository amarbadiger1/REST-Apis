import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await userModel.findOne({ username }).select("-password");

    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User Not Found" });
    }

    res.status(200).send({ success: true, message: "Profile Fetched", user });
  } catch (error) {
    console.log("error during profile fecthing :", error.message);
    return res.status(500).send("Server Error");
  }
};

const followUnfollowUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid ID" });
    }

    const currentUser = await userModel.findById(req.user._id);
    const otherUser = await userModel.findById(id);

    if (id === req.user._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "You cannot follow/unfollow yourself",
      });
    }

    if (!currentUser || !otherUser) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow
      await userModel.findByIdAndUpdate(id, {
        $pull: { followers: req.user._id },
      });
      await userModel.findByIdAndUpdate(req.user._id, {
        $pull: { following: id },
      });

      return res
        .status(200)
        .send({ success: true, message: "User unfollowed" });
    } else {
      // Follow
      await userModel.findByIdAndUpdate(id, {
        $push: { followers: req.user._id },
      });
      await userModel.findByIdAndUpdate(req.user._id, {
        $push: { following: id },
      });
      //notification
      const notification = new Notification({
        type: "follow",
        from: req.user._id,
        to: otherUser._id,
      });

      await notification.save();

      return res.status(200).send({ success: true, message: "User followed" });
    }
  } catch (error) {
    console.error("Error in followUnfollowUser:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
};
const getSuggestionUsers = async (req, res) => {
  try {
    // following of my users should not appear
    // my own userid should not appear
    // suggest some 4 to 5 users who are not in my following and me itself
    const userId = req.user._id;

    const usersFollowedbyme = await userModel
      .findById(userId)
      .select("following");

    const users = await userModel.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !usersFollowedbyme.following.includes(user._id)
    );

    const suggestdUsers = filteredUsers.slice(0, 4);

    suggestdUsers.forEach((user) => (user.password = null));

    res.status(200).send({
      success: true,
      message: "The user Fetched",
      user: suggestdUsers,
    });
  } catch (error) {
    console.log("Error in Getting Suggestion users", error.message);
    return res.status(500).send({ success: false, message: "Server Error" });
  }
};

const updateProfile = async (req, res) => {
  const { username, fullname, email, currentPassword, newPassword, bio, link } =
    req.body;
  const { profileImg, coverImg } = req.body;
  const userId = req.user._id;
  try {
    let user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({ success: false, message: "Not Found" });
    }
    if (
      (!currentPassword && newPassword) ||
      (!newPassword && currentPassword)
    ) {
      return res.status(400).send({
        success: false,
        message: "Please Provide Both current password and new password",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .send({ success: true, message: "Current Password id Incorret" });
      }
      if (newPassword.length < 6) {
        return res.status(400).send({
          success: false,
          message: "The password must be atlest 6 characters Long",
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }
    user.fullName = fullname || user.fullName;
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    user.password = null;
    return res.status(200).send({ user });
  } catch (error) {
    console.log("Error during update profile", error.message);
    return res.status(500).send({ success: false, message: "Server Error" });
  }
};
export {
  getUserProfile,
  followUnfollowUser,
  getSuggestionUsers,
  updateProfile,
};
