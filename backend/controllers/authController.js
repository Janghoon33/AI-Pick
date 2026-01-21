// controllers/authController.js
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthController {
  // Google 로그인
  static async googleLogin(req, res) {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential이 필요합니다.' });
    }

    try {
      // Google 토큰 검증
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture } = payload;

      // 사용자 찾기 또는 생성
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

      // JWT 토큰 생성
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          apiKeyStatus: user.getApiKeyStatus()
        }
      });
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      res.status(401).json({ error: '인증에 실패했습니다.' });
    }
  }

  // 현재 사용자 정보
  static async getMe(req, res) {
    try {
      const user = await User.findByPk(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        apiKeyStatus: user.getApiKeyStatus()
      });
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  }

  // API 키 저장
  static async saveApiKey(req, res) {
    const { service, apiKey } = req.body;

    if (!service || !apiKey) {
      return res.status(400).json({ error: '서비스와 API 키를 입력해주세요.' });
    }

    const validServices = ['openai', 'anthropic', 'google', 'groq', 'cohere'];
    if (!validServices.includes(service)) {
      return res.status(400).json({ error: '지원하지 않는 서비스입니다.' });
    }

    try {
      const user = await User.findByPk(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      }

      user.setApiKey(service, apiKey);
      await user.save();

      res.json({
        message: 'API 키가 저장되었습니다.',
        apiKeyStatus: user.getApiKeyStatus()
      });
    } catch (error) {
      console.error('API 키 저장 오류:', error);
      res.status(500).json({ error: 'API 키 저장에 실패했습니다.' });
    }
  }

  // API 키 삭제
  static async deleteApiKey(req, res) {
    const { service } = req.params;

    const validServices = ['openai', 'anthropic', 'google', 'groq', 'cohere'];
    if (!validServices.includes(service)) {
      return res.status(400).json({ error: '지원하지 않는 서비스입니다.' });
    }

    try {
      const user = await User.findByPk(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      }

      user.deleteApiKey(service);
      await user.save();

      res.json({
        message: 'API 키가 삭제되었습니다.',
        apiKeyStatus: user.getApiKeyStatus()
      });
    } catch (error) {
      console.error('API 키 삭제 오류:', error);
      res.status(500).json({ error: 'API 키 삭제에 실패했습니다.' });
    }
  }

  // API 키 상태 조회
  static async getApiKeyStatus(req, res) {
    try {
      const user = await User.findByPk(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      }

      res.json({ apiKeyStatus: user.getApiKeyStatus() });
    } catch (error) {
      console.error('API 키 상태 조회 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  }
}

module.exports = AuthController;
