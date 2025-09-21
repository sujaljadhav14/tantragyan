import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {

        const conn = await mongoose.connect(process.env.MONGODB_URI, {

        });

        console.log('Connected to MongoDB Atlas');

    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDB;
