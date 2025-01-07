import { Module } from '@nestjs/common';
import * as Minio from 'minio';

import { MinioService } from './services';
import { storageConfig, StorageConfigType } from '@/common/config';
import { hasUndefinedField } from '@/common/misc';

/**
 * Handles storage of media files, through different storage providers.
 */
@Module({
  providers: [
    MinioService,
    /**
     * Create Minio client instance for use with MinioService.
     */
    {
      provide: Minio.Client,
      useFactory: (
        appStorageConfig: StorageConfigType,
      ): Minio.Client | null => {
        if (hasUndefinedField(appStorageConfig.minio)) {
          return null;
        }
        return new Minio.Client({
          endPoint: appStorageConfig.minio.endpoint!,
          port: appStorageConfig.minio.port,
          useSSL: appStorageConfig.minio.useSSL,
          accessKey: appStorageConfig.minio.accessKey,
          secretKey: appStorageConfig.minio.secretKey,
        });
      },
      inject: [storageConfig.KEY],
    },
  ],
  exports: [MinioService],
})
export class StorageModule {}
