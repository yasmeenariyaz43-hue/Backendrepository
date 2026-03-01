const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

class UserModel {
    // Create a new user
    static async create(userData) {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        const { data, error } = await supabase
            .from('users')
            .insert([{
                email: userData.email,
                username: userData.username,
                password_hash: hashedPassword,
                full_name: userData.fullName || userData.username,
                created_at: new Date(),
                updated_at: new Date()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Find user by email
    static async findByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    // Find user by username
    static async findByUsername(username) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    // Find user by ID
    static async findById(id) {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, username, full_name, avatar_url, bio, created_at')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    // Update user
    static async update(id, updates) {
        const { data, error } = await supabase
            .from('users')
            .update({
                ...updates,
                updated_at: new Date()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Compare password
    static async comparePassword(candidatePassword, hashedPassword) {
        return await bcrypt.compare(candidatePassword, hashedPassword);
    }
}

module.exports = UserModel;