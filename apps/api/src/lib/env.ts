function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const env = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: (process.env.NODE_ENV ?? 'development') as 'development' | 'production' | 'test',
  STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT ?? 'http://localhost:9000',
  STORAGE_ACCESS_KEY: process.env.STORAGE_ACCESS_KEY ?? 'minioadmin',
  STORAGE_SECRET_KEY: process.env.STORAGE_SECRET_KEY ?? 'minioadmin',
  STORAGE_BUCKET: process.env.STORAGE_BUCKET ?? 'ironquill',
  STORAGE_PUBLIC_URL: process.env.STORAGE_PUBLIC_URL ?? 'http://localhost:9000/ironquill',
};
