import { Logger } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const logger = new Logger('Storage Config');

type StorageConfig = {
  /**
   * VNG Cloud VStorage-related configuration, including:
   * - `vStorageClientId`: Client ID for VStorage service accoun
   * - `vStorageClientSecret`: Client secret for VStorage service account
   */
  vstorage: {
    vStorageClientId?: string;
    vStorageClientSecret?: string;
  };
};

export const storageConfig = registerAs('storage', () => {
  const configValues: StorageConfig = {
    vstorage: {
      vStorageClientId: process.env.VSTORAGE_CLIENT_ID,
      vStorageClientSecret: process.env.VSTORAGE_CLIENT_SECRET,
    },
  };

  const validationSchema = z.object({
    vstorage: z.object({
      vStorageClientId: z.string().optional(),
      vStorageClientSecret: z.string().optional(),
    }),
  });

  /**
   * Warning logs for potentially missing configuration
   */
  if (Object.values(configValues.vstorage).length === 0) {
    logger.warn(
      'No VStorage configuration found. This may result in errors when interacting with VStorage',
    );
  }

  validationSchema.parse(configValues);

  return configValues;
});
