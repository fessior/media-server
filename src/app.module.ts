import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { BullQueues, QueueName } from './common/bullmq/constants';
import { commonConfig, storageConfig, videoConfig } from './common/config';
import { LocalRouteGuard } from './common/local-route/guards';
import { VideoModule } from './videos/video.module';

/**
 * Module for main server
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [commonConfig, storageConfig, videoConfig],
    }),
    BullQueues[QueueName.PROCESS_VIDEO],
    VideoModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: LocalRouteGuard }],
})
export class AppModule {}
