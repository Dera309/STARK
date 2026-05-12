const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optional = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

export const env = {
  PORT: parseInt(optional('PORT', '3003'), 10),
  MONGODB_URI: optional('MONGODB_URI', 'mongodb://localhost:27017/stark'),
  JWT_SECRET: optional('JWT_SECRET', 'change-me-in-production'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '24h'),
  EMAIL_HOST: optional('EMAIL_HOST', ''),
  EMAIL_PORT: parseInt(optional('EMAIL_PORT', '587'), 10),
  EMAIL_USER: optional('EMAIL_USER', ''),
  EMAIL_PASS: optional('EMAIL_PASS', ''),
};

export const validateEnv = (): void => {
  if (process.env.NODE_ENV === 'production') {
    required('MONGODB_URI');
    required('JWT_SECRET');
  }
};
