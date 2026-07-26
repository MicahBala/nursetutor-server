import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import userRoutes from "./routes/userRoute.js";
import topicRoutes from "./routes/topicsRoute.js";
import resultsRoutes from "./routes/resultsRoute.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/results', resultsRoutes);

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