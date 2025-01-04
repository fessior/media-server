import { BullModule } from '@nestjs/bullmq';
import { DynamicModule } from '@nestjs/common';

import { commonConfig, CommonConfigType } from '@/common/config';

export const QueueName = <const>{
  PROCESS_VIDEO: 'process_video',
};

export const BullQueues = Object.entries(QueueName).reduce(
  (acc, [, value]) => ({
    ...acc,
    [value]: BullModule.registerQueueAsync({
      name: value,
      useFactory: (appCommonConfig: CommonConfigType) => ({
        connection: {
          host: appCommonConfig.redisHost,
          port: appCommonConfig.redisPort,
        },
      }),
      inject: [commonConfig.KEY],
    }),
  }),
  <Record<string, DynamicModule>>{},
);
