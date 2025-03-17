// controllers/user.controller.js

import User from "../models/User.model.js";
import crypto from "crypto"; // it can generate random bytes
import nodemailer from "nodemailer";

const registerUser = async (req, res) => {
  // res.send("User registered successfully");

  // send success status to user

  // Get User Data
  const { name, email, password } = req.body; // we have data now

  // validate
  if (!name || !email || !password) {
    return res.status(400).json({
      massage: "All fields are required",
    });
  }

  // check if user already exist's
  try {
    const existingUser = await User.findOne({ email }); // sir said - dushre continent me hai db
    if (existingUser) {
      return res.status(400).json({
        massage: "User already exists",
      });
    }

    // if not exists - Create a user in db
    const user = await User.create({
      name,
      email,
      password,
    });

    console.log(user); // jo bhi model create kiya tha wo pura model hai

    if (!user) {
      return res.status(400).json({
        massage: "User Not Registerd",
      });
    }

    // create a varification token
    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;
    console.log(token);

    // save token in db
    await user.save();

    // console.log("aajaaoaoookdfoasjkds");

    // send token as email to user .
    const transport = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });

    const mailOption = {
      from: process.env.MAILTRAP_SENDERMAIL,
      to: user.email,
      subject: "Verify your Email", // Subject line
      text: `Please Click on the following link :${process.env.BASE_URL}/api/v1/user/verify ${token}`,
    };
    
    await transport.sendMail(mailOption);
    res.status(200).json({
      massage: "User registerd Successfully",
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      massage: "User not registerd ",
      error,
      success: false,
    });
  }
};

const verifyUser = async (req, res) => {
  //get token form url .
  // validate .
  // find user based on token .
  // if User Not Present
  // set isVerified filed to true .
  // remove Verification token .
  // save .
  // return response .

  const { token } = req.params;
  console.log(token);
  if (!token) {
    return res.status(400).json({
      massage: "Invailed User Token",
    });
  }

  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return res.status(400).json({
      massage: "Invailed Token",
    });
  }

  user.isVerified = true;
  user.verificationToken = undefined;

  await user.save();

};

const loginUser = async (req, res) => {
  res.send("User logged in successfully");
};

export { registerUser, loginUser, verifyUser };
