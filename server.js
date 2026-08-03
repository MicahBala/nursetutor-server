import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import userRoutes from "./routes/userRoute.js";
import topicRoutes from "./routes/topicsRoute.js";
import resultsRoutes from "./routes/resultsRoute.js";
import progressRoutes from "./routes/progressRoute.js";
import mockExamRoutes from "./routes/mockExamRoutes.js";
import adminRoutes from './routes/adminRoute.js';

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://nursetutor-client.vercel.app' // Your Vercel domain
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy violation'));
    },
    credentials: true
}));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/mock-exams', mockExamRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send("Nurse Tutor API is running...");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();