// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(logger);

// 라우트 설정
app.use('/api', aiRoutes);
app.use('/api/auth', authRoutes);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ error: '요청하신 경로를 찾을 수 없습니다.' });
});

// 에러 핸들러 (마지막에 위치)
app.use(errorHandler);

// 서버 시작
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // DB 연결
    await connectDB();

    app.listen(PORT, () => {
      console.log(`AI-PICK 서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`API 엔드포인트: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
