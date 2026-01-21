// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ai_pick',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mariadb',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      allowPublicKeyRetrieval: true
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL 연결 성공');

    // 테이블 동기화 (개발 환경에서만 alter 사용해 db 설정)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('테이블 동기화 완료');
  } catch (error) {
    console.error('MySQL 연결 실패:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
