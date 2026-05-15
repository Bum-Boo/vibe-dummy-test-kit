export type ApiConfig = {
  port: number;
  databaseUrl: string;
  redisUrl: string;
  minioEndpoint: string;
  minioBucket: string;
};

export const config: ApiConfig = {
  port: Number(process.env.API_PORT ?? 4000),
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgres://bts_lab:FAKE_LOCAL_POSTGRES_PASSWORD@localhost:5432/bts_sec_lab",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  minioEndpoint: process.env.MINIO_ENDPOINT ?? "http://localhost:9000",
  minioBucket: process.env.MINIO_BUCKET ?? "bts-sec-lab-local"
};

export function publicConfig() {
  return {
    port: config.port,
    redisConfigured: Boolean(config.redisUrl),
    minioEndpoint: config.minioEndpoint,
    minioBucket: config.minioBucket,
    databaseConfigured: Boolean(config.databaseUrl)
  };
}

