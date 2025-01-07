import { Module } from '@nestjs/common';

import { BullQueues, QueueName } from './constants';

/**
 * Takes care of setting up and subscribing to queues
 */
@Module({
  imports: [BullQueues[QueueName.PROCESS_VIDEO]],
})
export class QueueModule {}
