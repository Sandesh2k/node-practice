const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const users = require("../data/users");
const AppError = require("../errors/AppError");
const User = require("../models/User");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: normalizedEmail });

      if (existingUser) {
        return next(new AppError("User with this email already exists", 409));
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: normalizedEmail,
        passwordHash: hashedPassword,
      });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      });
    }

    const existingUser = users.find((user) => user.email === normalizedEmail);

    if (existingUser) {
      return next(new AppError("User with this email already exists", 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length ? Math.max(...users.map((user) => user.id)) + 1 : 1,
      name,
      email: normalizedEmail,
      passwordHash: hashedPassword,
      password: hashedPassword,
    };

    users.push(newUser);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: normalizedEmail });

      if (!user) {
        return next(new AppError("Invalid email or password", 401));
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);

      if (!passwordMatches) {
        return next(new AppError("Invalid email or password", 401));
      }

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        }
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
      });
    }

    const user = users.find((item) => item.email === normalizedEmail);

    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    const storedHash = user.passwordHash || user.password;
    const passwordMatches = await bcrypt.compare(password, storedHash);

    if (!passwordMatches) {
      return next(new AppError("Invalid email or password", 401));
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};