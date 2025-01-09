import { BullModule } from '@nestjs/bullmq';
import { DefaultJobOptions } from 'bullmq';

import { commonConfig, CommonConfigType } from '@/common/config';

export const QueueName = {
  PROCESS_VIDEO: 'process_video',
};

/**
 * Settings for process video queue
 */
const PROCESS_VIDEO_QUEUE_OPTIONS: DefaultJobOptions = {
  attempts: 3,
  removeOnComplete: {
    age: 3600, // keep up to 1 hour
    count: 1000, // keep up to 1000 jobs
  },
  removeOnFail: {
    age: 24 * 3600, // keep up to 24 hours
  },
};

export const BullQueues = {
  [QueueName.PROCESS_VIDEO]: BullModule.registerQueueAsync({
    name: QueueName.PROCESS_VIDEO,
    useFactory: (appCommonConfig: CommonConfigType) => ({
      connection: {
        host: appCommonConfig.redisHost,
        port: appCommonConfig.redisPort,
      },
      defaultJobOptions: PROCESS_VIDEO_QUEUE_OPTIONS,
    }),
    inject: [commonConfig.KEY],
  }),
};
