import Notification from "../models/notification.model.js";

export const getNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const notification = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).send({ notification });
  } catch (error) {
    console.log("Error in getNotification", error.message);
    return res.status(500).send({ message: "server Error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });

    res.status(200).send({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotification", error.message);
    return res.status(500).send({ message: "server Error" });
  }
};

export const deleteOneNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const notification = await Notification.findById(notification);
    if (!notification) {
      return res.status(404).send({ message: "Notification Not Found" });
    }

    if (notification.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .send({ message: "You are NOt allowed to edelete this notification" });
    }

    await Notification.findByIdAndDelete(id);
    res.status(200).send({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log("Error in deleteoneNotification", error.message);
    return res.status(500).send({ message: "server Error" });
  }
};
