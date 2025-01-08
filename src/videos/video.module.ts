import { Module } from '@nestjs/common';

import { VideoProcessor } from './queues';
import { VideoProcessingService } from './services';
import { BullQueues, QueueName } from '@/common/bullmq/constants';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [BullQueues[QueueName.PROCESS_VIDEO], StorageModule],
  providers: [VideoProcessingService, VideoProcessor],
})
export class VideoModule {}
