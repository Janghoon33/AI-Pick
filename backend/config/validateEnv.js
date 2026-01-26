// config/validateEnv.js
const requiredEnvVars = [
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'ENCRYPTION_SALT',
    'GOOGLE_CLIENT_ID',
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
];

function validateEnv() {
    const missing = [];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }

    if (missing.length > 0) {
        console.error('='.repeat(50));
        console.error('필수 환경변수가 설정되지 않았습니다:');
        missing.forEach(v => console.error(`  - ${v}`));
        console.error('='.repeat(50));
        process.exit(1);
    }

    // 보안 키 길이 검증
    if (process.env.JWT_SECRET.length < 32) {
        console.error('JWT_SECRET은 최소 32자 이상이어야 합니다.');
        process.exit(1);
    }

    if (process.env.ENCRYPTION_KEY.length < 32) {
        console.error('ENCRYPTION_KEY는 최소 32자 이상이어야 합니다.');
        process.exit(1);
    }

    if (process.env.ENCRYPTION_SALT.length < 16) {
        console.error('ENCRYPTION_SALT는 최소 16자 이상이어야 합니다.');
        process.exit(1);
    }

    console.log('환경변수 검증 완료');
}

module.exports = validateEnv;
