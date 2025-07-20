const User = require("../models/user");
const jwt = require("../middleware/authMiddleware");
const jsonwebtoken = require("jsonwebtoken");


exports.register = async (req, res) => {
  const { name, email, address, profileImage, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      address,
      profileImage,
      password,
    });
    const accessToken = await jwt.generateAccessToken(user);
    const refreshToken = await jwt.generateRefreshToken(user);
    res.status(201).json({ accessToken,refreshToken , user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = await jwt.generateAccessToken(user);
    const refreshToken = await jwt.generateRefreshToken(user);    
    res.status(201).json({ accessToken,refreshToken , user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refresh = async (req, res) => {
  const { refresh } = req.body;
  try {
    const payload = jsonwebtoken.verify(refresh, process.env.REFRESH_SECRET);

    const token = jsonwebtoken.sign({ id: payload.id, email:payload.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};