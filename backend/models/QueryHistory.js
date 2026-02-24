// models/QueryHistory.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QueryHistory = sequelize.define('QueryHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  services: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '사용한 서비스 ID 배열 ex: ["openai", "anthropic"]'
  },
  responses: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '응답 배열 ex: [{serviceId, serviceName, answer, tokens, duration, error}]'
  },
  sessionId: {
    type: DataTypes.STRING(36),
    allowNull: true,
    field: 'session_id',
    comment: '같은 대화 세션 묶음 UUID'
  }
}, {
  tableName: 'query_histories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = QueryHistory;
