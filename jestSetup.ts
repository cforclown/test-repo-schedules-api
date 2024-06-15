process.env.NODE_ENV='test';

process.env.LOG_LEVEL='test';

process.env.PORT='55555';
process.env.ALLOWED_ORIGINS='http://localhost:55556';
process.env.API_VERSION='v1';

process.env.DB_HOST='mongo'
process.env.DB_PORT='27017'
process.env.DB_USERNAME='root'
process.env.DB_PASSWORD='root'
process.env.DB_NAME='test-repo-schedules-api'

process.env.SESSION_SECRET='LAAD1_SESSION_SECRET';

process.env.ACCESS_TOKEN_SECRET = 'ACCESS_TOKEN_SECRET';
process.env.REFRESH_TOKEN_SECRET = 'REFRESH_TOKEN_SECRET';
process.env.ACCESS_TOKEN_EXP_IN = '3600';

process.env.ENCRYPTION_ALGORITHM='aes-256-cbc';
process.env.ENCRYPTION_KEY = 'ENCRYPTION_KEY';
