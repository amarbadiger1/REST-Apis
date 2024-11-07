import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // getting token from cookies
    const token = req.cookies.jwt;
    // validate token
    if (!token) {
      return res
        .status(401)
        .send({ message: "Unauthorized : No Token Provided" });
    }
    // decode the token
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    // if invaild token
    if (!decode) {
      return res.status(401).send({ message: "Unauthorized: Invaild Token" });
    }
    // set the user
    const user = await userModel.findById(decode.userId).select("-password");
    if (!user) {
      return res.status(404).send({ message: "User Not Found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protected Route Middleware", error.message);
    return res.status(500).send({ message: "Internal server Error" });
  }
};
