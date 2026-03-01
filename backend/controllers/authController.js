const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Generate JWT Token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// Register new user
exports.register = catchAsync(async (req, res, next) => {
    const { email, username, password, fullName } = req.body;

    // Check if user exists
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
        return next(new AppError('Email already exists', 400));
    }

    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
        return next(new AppError('Username already taken', 400));
    }

    // Create user
    const newUser = await UserModel.create({
        email,
        username,
        password,
        fullName
    });

    // Generate token
    const token = signToken(newUser.id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            fullName: newUser.full_name
        }
    });
});

// Login user
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
        return next(new AppError('Invalid email or password', 401));
    }

    // Check password
    const isPasswordCorrect = await UserModel.comparePassword(password, user.password_hash);
    if (!isPasswordCorrect) {
        return next(new AppError('Invalid email or password', 401));
    }

    // Update last login
    await UserModel.update(user.id, { last_login: new Date() });

    // Generate token
    const token = signToken(user.id);

    res.status(200).json({
        status: 'success',
        token,
        data: {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.full_name
        }
    });
});

// Get current user
exports.getMe = catchAsync(async (req, res, next) => {
    const user = await UserModel.findById(req.user.id);

    res.status(200).json({
        status: 'success',
        data: user
    });
});