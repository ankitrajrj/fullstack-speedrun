import mongoose from "mongoose";

import dotenv from "dotenv";

dotenv.config();

const db = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(console.log("Connected to MongoDb"))
    .catch((err) => {
      console.log("Error Connecting to mongodb");
    });
};

export default db 

