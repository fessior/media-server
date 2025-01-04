import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Post } from '@nestjs/common';
import { Queue } from 'bullmq';

import { QueueName } from '../constants';
import { LocalRoute } from '@/common/local-route/decorators';

/**
 * TODO(qhung312): Remove this controller after testing
 */
@Controller({
  version: '1',
  path: 'videos',
})
export class VideoController {
  constructor(
    @InjectQueue(QueueName.PROCESS_VIDEO) private videoQueue: Queue,
  ) {}

  @LocalRoute()
  @Post('upload')
  async processVideo(): Promise<void> {
    console.log('Adding video to queue');
    await this.videoQueue.add('process', { videoId: '123' });
  }
}
