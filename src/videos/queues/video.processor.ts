import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { VideoProcessingService } from '../services';
import { VideoProcessingJob, videoProcessingJobSchema } from '../types';
import { QueueName } from '@/common/bullmq/constants';
import { cleanWorkspace, prepareWorkspace } from '@/common/bullmq/utils';
import {
  commonConfig,
  CommonConfigType,
  videoConfig,
  VideoConfigType,
} from '@/common/config';

@Processor(QueueName.PROCESS_VIDEO)
export class VideoProcessor extends WorkerHost {
  private readonly logger: Logger = new Logger(VideoProcessor.name);

  constructor(
    @Inject(videoConfig.KEY) private appVideoConfig: VideoConfigType,
    @Inject(commonConfig.KEY) private appCommonConfig: CommonConfigType,
    private videoProcessingService: VideoProcessingService,
  ) {
    super();

    /**
     * We can only configure worker after it has initialized
     */
    process.nextTick(() => {
      this.worker.concurrency = this.appVideoConfig.videoProcessingConcurrency;
    });
  }

  override async process(job: Job<VideoProcessingJob>): Promise<void> {
    /**
     * Wrap in try-catch to ensure we clean up workspace afterwards.
     */
    const jobId = job.id!;
    let workspace: string | undefined;

    try {
      this.logger.log(`Processing video job ${jobId}`);
      workspace = prepareWorkspace(this.appCommonConfig.mediaWorkdir, jobId);
      await videoProcessingJobSchema.parseAsync(job.data);
      await this.videoProcessingService.encodeAndUploadHlsStream(
        job,
        workspace,
      );
      this.logger.log(`Successfully processed video job ${jobId}`);
    } catch (error) {
      this.logger.error(`Error processing video ${jobId}: ${error}`);
      throw error;
    } finally {
      if (workspace) {
        cleanWorkspace(workspace);
      }
    }
  }
}
