import mongoose from "mongoose";

export const connMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(
      `MongoDB Connected Successfully: ${conn.connection.host}`.bgGreen
    );
  } catch (error) {
    console.log(
      `Something went wrong, MongoDB not connected: ${error.message}`.bgRed
    );
    process.exit(1);
  }
};
