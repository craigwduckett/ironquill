function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function requireEnvInProd(key: string, devDefault: string): string {
  const value = process.env[key];
  if (!value) {
    const nodeEnv = process.env.NODE_ENV ?? 'development';
    if (nodeEnv === 'production') {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return devDefault;
  }
  return value;
}

export const env = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: (process.env.NODE_ENV ?? 'development') as 'development' | 'production' | 'test',
  STORAGE_ENDPOINT: requireEnvInProd('STORAGE_ENDPOINT', 'http://localhost:9000'),
  STORAGE_ACCESS_KEY: requireEnvInProd('STORAGE_ACCESS_KEY', 'minioadmin'),
  STORAGE_SECRET_KEY: requireEnvInProd('STORAGE_SECRET_KEY', 'minioadmin'),
  STORAGE_BUCKET: requireEnvInProd('STORAGE_BUCKET', 'ironquill'),
  STORAGE_PUBLIC_URL: requireEnvInProd('STORAGE_PUBLIC_URL', 'http://localhost:9000/ironquill'),
};
