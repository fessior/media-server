import { Logger } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

import { hasUndefinedField } from '../misc';

const logger = new Logger('Storage Config');

type StorageConfig = {
  /**
   * Support for MinIO-based storage
   */
  minio: {
    endpoint?: string;
    port?: number;
    useSSL?: boolean;
    accessKey?: string;
    secretKey?: string;
  };
};

export const storageConfig = registerAs('storage', () => {
  const configValues: StorageConfig = {
    minio: {
      endpoint: process.env.MINIO_ENDPOINT,
      port: parseInt(<string>process.env.MINIO_PORT, 10),
      useSSL: process.env.MINIO_USE_SSL
        ? process.env.MINIO_USE_SSL === 'true'
        : undefined,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    },
  };

  const validationSchema = z.object({
    minio: z.object({
      endpoint: z.string().nonempty().optional(),
      port: z.number().int().positive().optional(),
      useSSL: z.boolean().optional(),
      accessKey: z.string().nonempty().optional(),
      secretKey: z.string().nonempty().optional(),
    }),
  });

  validationSchema.parse(configValues);

  /**
   * Warning logs for potentially missing configuration
   */
  if (hasUndefinedField(configValues.minio)) {
    logger.warn(
      'Missing MinIO configuration. This may result in errors when interacting with MinIO',
    );
  }

  return configValues;
});

export type StorageConfigType = ConfigType<typeof storageConfig>;
