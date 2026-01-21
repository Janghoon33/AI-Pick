// models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production!';
const IV_LENGTH = 16;

// API 키 암호화
function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// API 키 복호화
function decrypt(text) {
  if (!text) return null;
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = parts.join(':');
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
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

// API 키 저장 (암호화)
User.prototype.setApiKey = function(service, apiKey) {
  const fieldMap = {
    openai: 'openaiKey',
    anthropic: 'anthropicKey',
    google: 'googleKey',
    groq: 'groqKey',
    cohere: 'cohereKey'
  };
  const field = fieldMap[service];
  if (field) {
    this[field] = encrypt(apiKey);
  }
};

// API 키 조회 (복호화)
User.prototype.getApiKey = function(service) {
  const fieldMap = {
    openai: 'openaiKey',
    anthropic: 'anthropicKey',
    google: 'googleKey',
    groq: 'groqKey',
    cohere: 'cohereKey'
  };
  const field = fieldMap[service];
  return field ? decrypt(this[field]) : null;
};

// 모든 API 키 조회 (복호화)
User.prototype.getAllApiKeys = function() {
  return {
    openai: decrypt(this.openaiKey),
    anthropic: decrypt(this.anthropicKey),
    google: decrypt(this.googleKey),
    groq: decrypt(this.groqKey),
    cohere: decrypt(this.cohereKey)
  };
};

// API 키 존재 여부만 반환 (보안)
User.prototype.getApiKeyStatus = function() {
  return {
    openai: !!this.openaiKey,
    anthropic: !!this.anthropicKey,
    google: !!this.googleKey,
    groq: !!this.groqKey,
    cohere: !!this.cohereKey
  };
};

// API 키 삭제
User.prototype.deleteApiKey = function(service) {
  const fieldMap = {
    openai: 'openaiKey',
    anthropic: 'anthropicKey',
    google: 'googleKey',
    groq: 'groqKey',
    cohere: 'cohereKey'
  };
  const field = fieldMap[service];
  if (field) {
    this[field] = null;
  }
};

module.exports = User;
