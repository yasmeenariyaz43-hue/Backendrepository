// backend/controllers/achievementController.js
const AchievementModel = require('../models/AchievementModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getUserAchievements = catchAsync(async (req, res, next) => {
    const achievements = await AchievementModel.getUserAchievements(req.user.id);
    const stats = await AchievementModel.getAchievementStats(req.user.id);
    
    res.status(200).json({
        status: 'success',
        data: {
            achievements,
            stats
        }
    });
});

exports.getAllAchievements = catchAsync(async (req, res, next) => {
    const achievements = await AchievementModel.getAllAchievements();
    
    res.status(200).json({
        status: 'success',
        data: achievements
    });
});

exports.checkAndAwardAchievements = catchAsync(async (req, res, next) => {
    const newAchievements = await AchievementModel.checkAndAwardAchievements(req.user.id);
    
    res.status(200).json({
        status: 'success',
        data: newAchievements
    });
});