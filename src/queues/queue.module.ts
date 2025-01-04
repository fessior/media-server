import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { QueueName } from './constants';

/**
 * Small module which takes care of initializing queues
 */
@Module({
  imports: [
    ...Object.values(QueueName).map(name => BullModule.registerQueue({ name })),
  ],
})
export class QueueModule {}
