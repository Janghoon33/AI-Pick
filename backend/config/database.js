// config/database.js
const { Sequelize } = require('sequelize');

// Vercel Postgres 연결 설정
const sequelize = process.env.POSTGRES_URL
  ? new Sequelize(process.env.POSTGRES_URL, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'ai_pick',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await sequelize.authenticate();
    console.log('PostgreSQL 연결 성공');

    // 테이블 동기화 (프로덕션에서도 첫 실행 시 테이블 생성)
    await sequelize.sync();
    console.log('테이블 동기화 완료');

    isConnected = true;
  } catch (error) {
    console.error('PostgreSQL 연결 실패:', error.message);
    throw error;
  }
};

module.exports = { sequelize, connectDB };
