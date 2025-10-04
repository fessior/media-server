import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import * as expressBasicAuth from 'express-basic-auth';

import { BullQueues, QueueName } from './common/bullmq/constants';
import {
  commonConfig,
  CommonConfigType,
  storageConfig,
  videoConfig,
} from './common/config';
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
    BullBoardModule.forRootAsync({
      useFactory: ({ bullBoard }: CommonConfigType) => ({
        route: '/queues',
        adapter: ExpressAdapter,
        middleware: expressBasicAuth({
          challenge: true,
          users: {
            [bullBoard.username]: bullBoard.password,
          },
        }),
      }),
      inject: [commonConfig.KEY],
    }),
    BullQueues[QueueName.PROCESS_VIDEO],
    VideoModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: LocalRouteGuard }],
})
export class AppModule {}
