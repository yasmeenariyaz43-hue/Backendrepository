// backend/models/AchievementModel.js
const supabase = require('../config/supabase');

class AchievementModel {
    // Get all achievements for a user
    static async getUserAchievements(userId) {
        const { data, error } = await supabase
            .from('user_achievements')
            .select(`
                *,
                achievements (*)
            `)
            .eq('user_id', userId)
            .order('earned_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    // Get all available achievements
    static async getAllAchievements() {
        const { data, error } = await supabase
            .from('achievements')
            .select('*')
            .order('points', { ascending: true });
        
        if (error) throw error;
        return data;
    }

    // Check and award achievements
    static async checkAndAwardAchievements(userId) {
        const achievements = await this.getAllAchievements();
        const userAchievements = await this.getUserAchievements(userId);
        const earnedIds = userAchievements.map(ua => ua.achievement_id);
        
        const newAchievements = [];

        for (const achievement of achievements) {
            if (earnedIds.includes(achievement.id)) continue;

            const earned = await this.checkAchievementCriteria(userId, achievement);
            if (earned) {
                const awarded = await this.awardAchievement(userId, achievement.id);
                newAchievements.push(awarded);
            }
        }

        return newAchievements;
    }

    // Check specific achievement criteria
    static async checkAchievementCriteria(userId, achievement) {
        switch (achievement.criteria_type) {
            case 'streak':
                return await this.checkStreakCriteria(userId, achievement.criteria_value);
            case 'total_completions':
                return await this.checkTotalCompletionsCriteria(userId, achievement.criteria_value);
            case 'habits_count':
                return await this.checkHabitsCountCriteria(userId, achievement.criteria_value);
            case 'custom':
                return await this.checkCustomCriteria(userId, achievement);
            default:
                return false;
        }
    }

    // Check streak criteria
    static async checkStreakCriteria(userId, targetStreak) {
        const { data, error } = await supabase
            .from('habits')
            .select('current_streak')
            .eq('user_id', userId)
            .gte('current_streak', targetStreak);
        
        if (error) throw error;
        return data.length > 0;
    }

    // Check total completions criteria
    static async checkTotalCompletionsCriteria(userId, targetCompletions) {
        const { data, error } = await supabase
            .from('habit_logs')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
        
        if (error) throw error;
        return data.length >= targetCompletions;
    }

    // Check habits count criteria
    static async checkHabitsCountCriteria(userId, targetCount) {
        const { data, error } = await supabase
            .from('habits')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_active', true);
        
        if (error) throw error;
        return data.length >= targetCount;
    }

    // Award achievement to user
    static async awardAchievement(userId, achievementId) {
        const { data, error } = await supabase
            .from('user_achievements')
            .insert([{
                user_id: userId,
                achievement_id: achievementId,
                earned_at: new Date()
            }])
            .select(`
                *,
                achievements (*)
            `)
            .single();
        
        if (error) throw error;
        return data;
    }

    // Get achievement statistics
    static async getAchievementStats(userId) {
        const { data: userAchievements, error: userError } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', userId);
        
        if (userError) throw userError;

        const { data: allAchievements, error: allError } = await supabase
            .from('achievements')
            .select('*');
        
        if (allError) throw allError;

        const totalPoints = userAchievements.reduce((sum, ua) => {
            const achievement = allAchievements.find(a => a.id === ua.achievement_id);
            return sum + (achievement?.points || 0);
        }, 0);

        return {
            earned: userAchievements.length,
            total: allAchievements.length,
            points: totalPoints,
            completionRate: (userAchievements.length / allAchievements.length) * 100
        };
    }

    // Check custom criteria
    static async checkCustomCriteria(userId, achievement) {
        // Implement custom logic based on achievement name or ID
        switch (achievement.name) {
            case 'Early Bird':
                return await this.checkEarlyBirdCriteria(userId);
            case 'Night Owl':
                return await this.checkNightOwlCriteria(userId);
            case 'Perfect Week':
                return await this.checkPerfectWeekCriteria(userId);
            default:
                return false;
        }
    }

    // Early Bird: Complete habits before 8 AM for 7 days
    static async checkEarlyBirdCriteria(userId) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data, error } = await supabase
            .from('habit_logs')
            .select('completed_at')
            .eq('user_id', userId)
            .gte('completed_at', sevenDaysAgo.toISOString())
            .lte('completed_at', new Date().toISOString());
        
        if (error) throw error;

        const earlyBirdDays = data.filter(log => {
            const hour = new Date(log.completed_at).getHours();
            return hour < 8;
        }).length;

        return earlyBirdDays >= 7;
    }

    // Perfect Week: Complete all habits every day for a week
    static async checkPerfectWeekCriteria(userId) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: habits, error: habitsError } = await supabase
            .from('habits')
            .select('id')
            .eq('user_id', userId)
            .eq('is_active', true);
        
        if (habitsError) throw habitsError;

        const { data: logs, error: logsError } = await supabase
            .from('habit_logs')
            .select('habit_id, completed_date')
            .eq('user_id', userId)
            .gte('completed_date', sevenDaysAgo.toISOString().split('T')[0]);
        
        if (logsError) throw logsError;

        // Group logs by date
        const logsByDate = logs.reduce((acc, log) => {
            if (!acc[log.completed_date]) acc[log.completed_date] = [];
            acc[log.completed_date].push(log.habit_id);
            return acc;
        }, {});

        // Check if all habits were completed each day
        for (let i = 0; i < 7; i++) {
            const date = new Date(sevenDaysAgo);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            const completedHabits = logsByDate[dateStr] || [];
            const allCompleted = habits.every(habit => completedHabits.includes(habit.id));
            
            if (!allCompleted) return false;
        }

        return true;
    }
}

module.exports = AchievementModel;