// backend/models/HabitModel.js
const supabase = require('../config/supabase');

class HabitModel {
    // Create a new habit
    static async create(habitData) {
        const { data, error } = await supabase
            .from('habits')
            .insert([habitData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    // Get all habits for a user
    static async findByUserId(userId, filters = {}) {
        let query = supabase
            .from('habits')
            .select(`
                *,
                categories(name, color, icon),
                habit_logs(*)
            `)
            .eq('user_id', userId)
            .eq('is_active', true);

        if (filters.category) {
            query = query.eq('category_id', filters.category);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    // Get habit by ID
    static async findById(id) {
        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    }

    // Update habit
    static async update(id, updates) {
        const { data, error } = await supabase
            .from('habits')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    // Log habit completion
    static async logCompletion(habitId, userId, value = 1) {
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
            .from('habit_logs')
            .insert([{
                habit_id: habitId,
                user_id: userId,
                completed_date: today,
                value: value
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        // Update streak
        await this.updateStreak(habitId, userId);
        
        return data;
    }

    // Update streak
    static async updateStreak(habitId, userId) {
        // Complex streak logic here
        // Check consecutive days and update streak count
    }
}

module.exports = HabitModel;