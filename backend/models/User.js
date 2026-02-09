// models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const IV_LENGTH = 16;

// 암호화 키 가져오기 (지연 로딩)
function getEncryptionConfig() {
    const key = process.env.ENCRYPTION_KEY;
    const salt = process.env.ENCRYPTION_SALT;

    // 개발 환경에서는 기본값 허용, 프로덕션에서는 필수
    if (process.env.NODE_ENV === 'production') {
        if (!key || !salt) {
            throw new Error('ENCRYPTION_KEY와 ENCRYPTION_SALT 환경변수가 필요합니다.');
        }
    }

    return {
        key: key || 'dev-only-key-do-not-use-in-prod!!',
        salt: salt || 'dev-only-salt-16ch'
    };
}

// API 키 암호화
function encrypt(text) {
    if (!text) return null;
    const config = getEncryptionConfig();
    const iv = crypto.randomBytes(IV_LENGTH);
    const derivedKey = crypto.scryptSync(config.key, config.salt, 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// API 키 복호화
function decrypt(text) {
    if (!text) return null;
    try {
        const config = getEncryptionConfig();
        const parts = text.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = parts.join(':');
        const derivedKey = crypto.scryptSync(config.key, config.salt, 32);
        const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('복호화 오류:', error);
        return null;
    }
}

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  googleId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'google_id'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  picture: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  openaiKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'openai_key'
  },
  anthropicKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'anthropic_key'
  },
  googleKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'google_key'
  },
  groqKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'groq_key'
  },
  cohereKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cohere_key'
  },
  deepseekKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'deepseek_key'
  },
  mistralKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'mistral_key'
  },
  openrouterKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'openrouter_key'
  },
  togetherKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'together_key'
  },
  lastLogin: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'last_login'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 서비스 ID → 필드명 매핑
const SERVICE_FIELD_MAP = {
  openai: 'openaiKey',
  anthropic: 'anthropicKey',
  google: 'googleKey',
  groq: 'groqKey',
  cohere: 'cohereKey',
  deepseek: 'deepseekKey',
  mistral: 'mistralKey',
  openrouter: 'openrouterKey',
  together: 'togetherKey'
};

// API 키 저장 (암호화)
User.prototype.setApiKey = function(service, apiKey) {
  const field = SERVICE_FIELD_MAP[service];
  if (field) {
    this[field] = encrypt(apiKey);
  }
};

// API 키 조회 (복호화)
User.prototype.getApiKey = function(service) {
  const field = SERVICE_FIELD_MAP[service];
  return field ? decrypt(this[field]) : null;
};

// 모든 API 키 조회 (복호화)
User.prototype.getAllApiKeys = function() {
  return {
    openai: decrypt(this.openaiKey),
    anthropic: decrypt(this.anthropicKey),
    google: decrypt(this.googleKey),
    groq: decrypt(this.groqKey),
    cohere: decrypt(this.cohereKey),
    deepseek: decrypt(this.deepseekKey),
    mistral: decrypt(this.mistralKey),
    openrouter: decrypt(this.openrouterKey),
    together: decrypt(this.togetherKey)
  };
};

// API 키 존재 여부만 반환 (보안)
User.prototype.getApiKeyStatus = function() {
  return {
    openai: !!this.openaiKey,
    anthropic: !!this.anthropicKey,
    google: !!this.googleKey,
    groq: !!this.groqKey,
    cohere: !!this.cohereKey,
    deepseek: !!this.deepseekKey,
    mistral: !!this.mistralKey,
    openrouter: !!this.openrouterKey,
    together: !!this.togetherKey
  };
};

// API 키 삭제
User.prototype.deleteApiKey = function(service) {
  const field = SERVICE_FIELD_MAP[service];
  if (field) {
    this[field] = null;
  }
};

module.exports = User;
