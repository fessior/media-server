import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { commonConfig, CommonConfigType } from './common/config';
import { LocalRouteGuard } from './common/local-route/guards';
import { QueueModule } from './queues/queue.module';
import { WorkerManager } from './worker-manager';

/**
 * Module for main server
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [commonConfig],
    }),
    BullModule.forRootAsync({
      useFactory: (appCommonConfig: CommonConfigType) => ({
        connection: {
          host: appCommonConfig.redisHost,
          port: appCommonConfig.redisPort,
        },
      }),
      inject: [commonConfig.KEY],
    }),
    QueueModule,
  ],
  providers: [WorkerManager, { provide: APP_GUARD, useClass: LocalRouteGuard }],
})
export class AppModule {}
