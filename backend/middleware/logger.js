// middleware/logger.js
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    // API 키는 로그에서 제외
    const logBody = { ...req.body };
    if (logBody.apiKey) {
      logBody.apiKey = '***';
    }
    console.log('Request body:', logBody);
  }

  next();
};

module.exports = logger;