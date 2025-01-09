import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { VideoProcessor } from './queues';
import { TestProcessor } from './queues/test.processor';
import { VideoProcessingService } from './services';
import { BullQueues, QueueName } from '@/common/bullmq/constants';
import { commonConfig, CommonConfigType } from '@/common/config';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [
    BullQueues[QueueName.PROCESS_VIDEO],
    StorageModule,
    BullModule.registerQueueAsync({
      name: 'response',
      useFactory: (appCommonConfig: CommonConfigType) => ({
        connection: {
          host: appCommonConfig.redisHost,
          port: appCommonConfig.redisPort,
        },
      }),
      inject: [commonConfig.KEY],
    }),
  ],
  providers: [VideoProcessingService, VideoProcessor, TestProcessor],
})
export class VideoModule {}
