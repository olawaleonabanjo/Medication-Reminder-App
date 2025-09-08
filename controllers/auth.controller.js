import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/users.model.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';


export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error('User already exists with this email');
            error.statusCode = 409;
            throw error;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUsers = await User.create([{
            username,
            email,
            password: hashedPassword
        }], { session });

        const token = jwt.sign({ id: newUsers[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });


        await session.commitTransaction();
        session.endSession();
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { user: newUsers[0], token }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const signIn = async (req, res, next) => {

    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 404;
            throw error;
        }
        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const error = new Error('Invalid password');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            data: { user, token }
        });
        
    } catch (error) {
        next(error);
    }
}

export const signOut = async (req, res, next) => {
    try {
        res.clearCookie("token");

        res.status(200).json({
            success: true,
            message: "User signed out successfully"
        });
    } catch (error) {
        next(error);
    }
}