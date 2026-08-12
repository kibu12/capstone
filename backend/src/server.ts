import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analysisRouter from './routes/analysis';
import learningRouter from './routes/learning';
import quizRouter from './routes/quiz';
import interviewRouter from './routes/interview';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Capstone Backend API is running!',
    health: '/health',
    frontendUrl: 'http://localhost:3000'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'capstone-backend-api', timestamp: new Date().toISOString() });
});

// Mount API routes
app.use('/api', analysisRouter);
app.use('/api', learningRouter);
app.use('/api', quizRouter);
app.use('/api', interviewRouter);

app.listen(PORT, () => {
  console.log(`🚀 Capstone Standalone Backend API listening on http://localhost:${PORT}`);
});
