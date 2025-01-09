import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { VideoProcessingResponse } from '../types';

@Processor('response')
export class TestProcessor extends WorkerHost {
  constructor(@InjectQueue('response') private responseQueue: any) {
    super();
  }

  override async process(job: Job<VideoProcessingResponse>): Promise<void> {
    console.log(job.data.correlationId);
  }
}
