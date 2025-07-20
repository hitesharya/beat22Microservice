const jwt = require("jsonwebtoken");
const User = require("../models/user");

const secretKey = process.env.JWT_SECRET || "6767676888";

const signToken = (user) => {
  const payload = {
    id: user._id,
  };
  return jwt.sign(payload, secretKey);
};

const verifyToken = (req, res, next) =>
  jwt.verify(req.headers.authorization, secretKey, async (err, decoded) => {
    if (err || !decoded || !decoded.id) {
      return res.status(401).send({
        success: false,

        message: "UNAUTHORIZED",
      });
    }

    const user = await User.findOne({
      _id: decoded.id,
    });

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "UNAUTHORIZED",
      });
    }

    req.user = user;

    next();
  });


  const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};


module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  signToken,
};
