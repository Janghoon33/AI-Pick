// service/authService.js
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const VALID_SERVICES = ['openai', 'anthropic', 'google', 'groq', 'cohere', 'deepseek', 'mistral', 'openrouter'];

const authService = {
    // Google 토큰 검증 및 사용자 처리
    async googleLogin(credential) {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        let user = await User.findOne({ where: { googleId } });

        if (!user) {
            user = await User.create({
                googleId,
                email,
                name,
                picture
            });
        } else {
            user.lastLogin = new Date();
            await user.save();
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                apiKeyStatus: user.getApiKeyStatus()
            }
        };
    },

    // 사용자 ID로 조회
    async getUserById(userId) {
        const user = await User.findByPk(userId);
        if (!user) {
            const error = new Error('사용자를 찾을 수 없습니다.');
            error.status = 404;
            throw error;
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            apiKeyStatus: user.getApiKeyStatus()
        };
    },

    // API 키 저장
    async saveApiKey(userId, service, apiKey) {
        if (!VALID_SERVICES.includes(service)) {
            const error = new Error('지원하지 않는 서비스입니다.');
            error.status = 400;
            throw error;
        }

        const user = await User.findByPk(userId);
        if (!user) {
            const error = new Error('사용자를 찾을 수 없습니다.');
            error.status = 404;
            throw error;
        }

        user.setApiKey(service, apiKey);
        await user.save();

        return {
            message: 'API 키가 저장되었습니다.',
            apiKeyStatus: user.getApiKeyStatus()
        };
    },

    // API 키 삭제
    async deleteApiKey(userId, service) {
        if (!VALID_SERVICES.includes(service)) {
            const error = new Error('지원하지 않는 서비스입니다.');
            error.status = 400;
            throw error;
        }

        const user = await User.findByPk(userId);
        if (!user) {
            const error = new Error('사용자를 찾을 수 없습니다.');
            error.status = 404;
            throw error;
        }

        user.deleteApiKey(service);
        await user.save();

        return {
            message: 'API 키가 삭제되었습니다.',
            apiKeyStatus: user.getApiKeyStatus()
        };
    },

    // API 키 상태 조회
    async getApiKeyStatus(userId) {
        const user = await User.findByPk(userId);
        if (!user) {
            const error = new Error('사용자를 찾을 수 없습니다.');
            error.status = 404;
            throw error;
        }

        return { apiKeyStatus: user.getApiKeyStatus() };
    }
};

module.exports = authService;
