import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';

import { EMBED_WATERMARK_JOB, TRANSCODE_HLS_JOB } from '../constants/job-name';
import { VideoProcessingService } from '../services';
import {
  VideoProcessingJob,
  videoProcessingJobSchema,
  VideoProcessingResponse,
} from '../types';
import { QueueName } from '@/common/bullmq/constants';
import {
  cleanWorkspace,
  isReservedQueueName,
  prepareWorkspace,
} from '@/common/bullmq/utils';
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

  @OnWorkerEvent('failed')
  async onFailed(job: Job<VideoProcessingJob>, error: Error): Promise<void> {
    const responseQueue = this.getResponseQueue(job.data.responseQueue);
    this.logger.log(`Sending failed response for job ${job.id}`);
    /**
     * A job can specify a reserved queue as response queue, which will fail.
     * In that case, we want to skip sending response, since that would mean
     * sending to reserved queue.
     */
    if (!isReservedQueueName(job.data.responseQueue)) {
      await responseQueue.add('completed', {
        correlationId: job.data.messageId,
        status: 'failed',
        failedReason: error.message,
      });
    }
  }

  override async process(job: Job<VideoProcessingJob>): Promise<void> {
    /**
     * Wrap in try-catch to ensure we clean up workspace afterwards.
     */
    const jobId = job.id!;
    let workspace: string | undefined;

    try {
      this.logger.log(`Processing video job ${jobId}`);
      workspace = prepareWorkspace(
        this.appCommonConfig.mediaWorkdir,
        `${QueueName.PROCESS_VIDEO}-${jobId}`,
      );
      await videoProcessingJobSchema.parseAsync(job.data);

      /* Response queue should be different from request queues */
      if (isReservedQueueName(job.data.responseQueue)) {
        throw new Error('Response queue cannot be same as request queue');
      }

      switch (job.name) {
        case TRANSCODE_HLS_JOB:
          await this.videoProcessingService.encodeAndUploadHlsStream(
            job,
            workspace,
          );
          break;
        case EMBED_WATERMARK_JOB:
          await this.videoProcessingService.embedAndUploadWatermarkedVideo(
            job,
            workspace,
          );
          break;
        default:
          throw new Error(`Unsupported job name ${job.name}`);
      }
      const responseQueue = this.getResponseQueue(job.data.responseQueue);
      await responseQueue.add('completed', {
        correlationId: job.data.messageId,
        status: 'successful',
      });

      this.logger.log(`Successfully processed video job ${jobId}`);
    } catch (error) {
      this.logger.error(`Error processing video ${jobId}: ${error}`);
      throw error;
    } finally {
      if (workspace) {
        this.logger.log(`Cleaning up workspace ${workspace}`);
        cleanWorkspace(workspace);
      }
    }
  }

  private getResponseQueue(
    responseQueue: string,
  ): Queue<VideoProcessingResponse> {
    return new Queue(responseQueue, {
      connection: {
        host: this.appCommonConfig.redisHost,
        port: this.appCommonConfig.redisPort,
      },
    });
  }
}
