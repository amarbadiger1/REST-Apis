import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import Notification from "../models/notification.model.js";
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
  } catch (error) {
    console.log("Error in Getting Suggestion users", error.message);
    return res.status(500).send({ success: false, message: "Server Error" });
  }
};
export { getUserProfile, followUnfollowUser, getSuggestionUsers };
