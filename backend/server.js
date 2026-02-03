// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/database');
const validateEnv = require('./config/validateEnv');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// 환경변수 검증 (프로덕션에서 필수)
if (process.env.NODE_ENV === 'production') {
    validateEnv();
}

const app = express();

// 보안 헤더 설정 (Helmet)
app.use(helmet());

// CORS 설정
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // 서버 간 요청 또는 허용된 origin
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS 정책에 의해 차단되었습니다.'));
        }
    },
    credentials: true
}));

// Rate Limiting - 일반 API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100, // IP당 최대 100회 요청
    message: {
        error: '너무 많은 요청이 발생했습니다. 15분 후 다시 시도해주세요.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate Limiting - 인증 API (더 엄격)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 10, // IP당 최대 10회 요청
    message: {
        error: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// AI API Rate Limiting (비용 고려)
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1분
    max: 10, // IP당 분당 최대 10회
    message: {
        error: 'AI 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(express.json({ limit: '10kb' })); // body 크기 제한
app.use(logger);

// Rate Limiter 적용
app.use('/api/auth', authLimiter);
app.use('/api/ask', aiLimiter);
app.use('/api', apiLimiter);

// 라우트 설정
app.use('/api', aiRoutes);
app.use('/api/auth', authRoutes);

// 404 핸들러
app.use((req, res) => {
    res.status(404).json({ error: '요청하신 경로를 찾을 수 없습니다.' });
});

// 에러 핸들러 (마지막에 위치)
app.use(errorHandler);

// DB 연결 (Vercel Serverless에서는 요청 시 연결)
connectDB().catch(err => console.error('DB 연결 오류:', err));

// 로컬 개발 환경에서만 서버 시작
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`AI-PICK 서버가 포트 ${PORT}에서 실행 중입니다.`);
        console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
    });
}

// Vercel Serverless Function으로 export
module.exports = app;
