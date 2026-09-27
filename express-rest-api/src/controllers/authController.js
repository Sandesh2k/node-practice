const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const users = require("../data/users");
const AppError = require("../errors/AppError");

// POST /auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = users.find(
      (user) => user.email === email.toLowerCase()
    );

    if (existingUser) {
      return next(
        new AppError("User with this email already exists", 409)
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: users.length
        ? Math.max(...users.map((user) => user.id)) + 1
        : 1,
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    };

    users.push(newUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = users.find(
      (user) => user.email === email.toLowerCase()
    );

    if (!user) {
      return next(
        new AppError("Invalid email or password", 401)
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return next(
        new AppError("Invalid email or password", 401)
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h"
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};