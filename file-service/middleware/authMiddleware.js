const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET || "6767676888";

const verifyToken = (req, res, next) =>
  jwt.verify(req.headers.authorization, secretKey, async (err, decoded) => {
    if (err || !decoded || !decoded.id) {
      return res.status(401).send({
        success: false,

        message: "UNAUTHORIZED",
      });
    }

    req.user = decoded;

    next();
  });

module.exports = {
  verifyToken,
};
