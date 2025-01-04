import { Module } from '@nestjs/common';

import { BullQueues, QueueName } from './constants';
import { VideoController } from './controllers/video.controller';

/**
 * Takes care of setting up and subscribing to queues
 */
@Module({
  imports: [BullQueues[QueueName.PROCESS_VIDEO]],
  controllers: [VideoController],
})
export class QueueModule {}
