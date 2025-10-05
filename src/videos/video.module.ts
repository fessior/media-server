import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { Module } from '@nestjs/common';

import { VideoProcessor } from './queues';
import { VideoProcessingService } from './services';
import { BullQueues, QueueName } from '@/common/bullmq/constants';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [
    BullQueues[QueueName.PROCESS_VIDEO],
    BullBoardModule.forFeature({
      name: QueueName.PROCESS_VIDEO,
      adapter: BullMQAdapter,
    }),
    StorageModule,
  ],
  providers: [VideoProcessingService, VideoProcessor],
})
export class VideoModule {}
