import userModel from "../models/user.model.js";
import PostModel from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
export const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;
    const userId = req.user._id.toString();

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send("message:not Found");
    }

    if (!text && !image) {
      return res.status(400).send({ message: "post must have text or image" });
    }
    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      const image = uploadedResponse.secure_url;
    }
    const newPost = newPost({
      user: userId,
      text,
      image,
    });
    await newPost.save();
  } catch (error) {
    console.log("Error during creating post", error);
    return res.status(500).send({ message: "error in server" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).send({ message: "Not Found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .send({ message: "Your not authozird to delete this post" });
    }

    if (post.image) {
      await cloudinary.uploader.destroy(
        user.image.split("/").pop().split(".")[0]
      );
    }
    await PostModel.findByIdAndDelete(id);
  } catch (error) {
    console.log("Error during the deleting the post", error.message);
    return res.status(500).send({ message: "Server Error" });
  }
};

export const CommentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).send({ message: "Not Found" });
    }

    if (!text) {
      return res.status(400).send({ message: "Text filed is required" });
    }

    const comment = { user: userId, text };
    post.comment.push(comment);
    await post.save();

    res.status(200).send({ post });
  } catch (error) {
    console.log("Error during comments", error.message);
    return res.status(500).send({ message: "Server Error" });
  }
};
export const likeUnlike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(400).send({ message: "The Post Not Found" });
    }

    const userLikedPost = PostModel.likes.includes(userId);
    if (userLikedPost) {
      await post.updateOne({ _id: id }, { $pull: { likes: userId } });
      await userModel.updateOne(
        { _id: userId },
        { $pull: { lickedPosts: id } }
      );
      res.status(200).send({ message: "Post unlicked successfully" });
    } else {
      post.likes.push(userId);
      await userModel.updateOne(
        { _id: userId },
        { $push: { lickedPosts: id } }
      );
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
    }
  } catch (error) {
    console.log("Error in licking the post", error.message);
    return res.status(500).send({ message: "Server Error " });
  }
};
export const getAllPosts = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).send([]);
    }

    res.status(200).send(posts);
  } catch (error) {
    console.log("Error during fecting all posts");
    return res.status(500).send({ message: "Server Error" });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await userModel.find(userId);
    if (!user) {
      return res.status(404).send({ message: "User Not Found" });
    }

    const likedPosts = await PostModel.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).send({ likedPosts });
  } catch (error) {
    console.log("Error getting all likes ", error.message);
    return res.status(500).send({ message: "Server Error " });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User Not Found" });
    }

    const following = user.following;

    const feedPosts = await PostModel.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    res.status(200).send({ feedPosts });
  } catch (error) {
    console.log("error during Getfollowing post", error.message);
    return res.status(500).send({ message: "Server Error" });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await userModel.find({ username });
    if (!user) {
      return res.status(404).send({ message: "User Not Found" });
    }

    const posts = await PostModel.find({ user: user._id })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
  } catch (error) {
    console.log("error during GetuserPost", error.message);
    return res.status(500).send({ message: "Server Error" });
  }
};
