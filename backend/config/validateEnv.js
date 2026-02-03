// config/validateEnv.js
const requiredEnvVars = [
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'ENCRYPTION_SALT',
    'GOOGLE_CLIENT_ID'
];

// DB 환경변수: POSTGRES_URL 또는 개별 DB 설정 중 하나 필요
const dbEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

function validateEnv() {
    const missing = [];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }

    // POSTGRES_URL이 없으면 개별 DB 환경변수 확인
    if (!process.env.POSTGRES_URL) {
        for (const envVar of dbEnvVars) {
            if (!process.env[envVar]) {
                missing.push(envVar);
            }
        }
    }

    if (missing.length > 0) {
        const errorMsg = `필수 환경변수가 설정되지 않았습니다: ${missing.join(', ')}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    // 보안 키 길이 검증
    if (process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET은 최소 32자 이상이어야 합니다.');
    }

    if (process.env.ENCRYPTION_KEY.length < 32) {
        throw new Error('ENCRYPTION_KEY는 최소 32자 이상이어야 합니다.');
    }

    if (process.env.ENCRYPTION_SALT.length < 16) {
        throw new Error('ENCRYPTION_SALT는 최소 16자 이상이어야 합니다.');
    }

    console.log('환경변수 검증 완료');
}

module.exports = validateEnv;
