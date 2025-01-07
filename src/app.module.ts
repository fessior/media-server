import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { commonConfig, storageConfig } from './common/config';
import { LocalRouteGuard } from './common/local-route/guards';
import { BullQueues, QueueName } from './queues/constants';
import { QueueModule } from './queues/queue.module';
import { StorageModule } from './storage/storage.module';
import { WorkerManager } from './worker-manager';

/**
 * Module for main server
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [commonConfig, storageConfig],
    }),
    QueueModule,
    StorageModule,
    BullQueues[QueueName.PROCESS_VIDEO],
  ],
  providers: [WorkerManager, { provide: APP_GUARD, useClass: LocalRouteGuard }],
})
export class AppModule {}
