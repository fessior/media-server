import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Post } from '@nestjs/common';
import { Queue } from 'bullmq';

import { QueueName } from './common/bullmq/constants';
import { VideoProcessingJob } from './videos/types';

@Controller()
export class AppController {
  constructor(
    @InjectQueue(QueueName.PROCESS_VIDEO)
    private videoQueue: Queue<VideoProcessingJob>,
  ) {}

  @Post()
  async test(): Promise<void> {
    await this.videoQueue.add('hello', {
      messageId: '1',
      responseQueue: 'response',
      originalVideo: {
        storage: 'minio',
        bucket: 'english-teaching-raw-videos',
        key: 'sweettooth.mp4',
      },
      outputVideo: {
        storage: 'minio',
        bucket: 'english-teaching-processed-videos',
        prefix: 'fifth-english-video',
      },
    });
  }
}
