// backend/controllers/habitController.js
const HabitModel = require('../models/HabitModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.createHabit = catchAsync(async (req, res, next) => {
    const habitData = {
        ...req.body,
        user_id: req.user.id
    };
    
    const habit = await HabitModel.create(habitData);
    
    res.status(201).json({
        status: 'success',
        data: habit
    });
});

exports.getUserHabits = catchAsync(async (req, res, next) => {
    const habits = await HabitModel.findByUserId(req.user.id, req.query);
    
    res.status(200).json({
        status: 'success',
        results: habits.length,
        data: habits
    });
});

exports.logHabit = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { value } = req.body;
    
    const log = await HabitModel.logCompletion(id, req.user.id, value);
    
    res.status(200).json({
        status: 'success',
        data: log
    });
});

exports.updateHabit = catchAsync(async (req, res, next) => {
    const habit = await HabitModel.update(req.params.id, req.body);
    
    if (!habit) {
        return next(new AppError('Habit not found', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: habit
    });
});