const jwt = require("jsonwebtoken");
const AppError = require("../errors/AppError");

const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new AppError("Authentication required", 401)
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return next(
      new AppError("Invalid or expired token", 401)
    );
  }
};

module.exports = requireAuth;