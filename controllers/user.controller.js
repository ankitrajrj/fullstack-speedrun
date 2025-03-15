// controllers/user.controller.js

const registerUser = async (req, res) => {

  // res.send("User registered successfully");
  // check if user already exist's
  // if not exists - Create a user in db
  // create a varification token
  // save token in db
  // send token as email to user .
  // send success status to user

  // Get User Data
  const { name, email, password } = req.body; // we have data now

  // validate
  if (!name || !email || !password) {
    return res.status(400).json({
      massage: "All fields are required",
    });
  }
};

const loginUser = async (req, res) => {
  res.send("User logged in successfully");
};

export { registerUser, loginUser };
