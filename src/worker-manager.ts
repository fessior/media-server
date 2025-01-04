import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { Worker } from 'worker_threads';

import { commonConfig, CommonConfigType } from './common/config';
import { QueueName } from './queues/constants';

type WorkerInfo = {
  worker: Worker;
  isBusy: boolean;
  lastFinishedAt?: Date;
};

/**
 * Handles the allocation and deallocation of worker threads, and finding a free
 * worker thread to assign to work to.
 */
@Processor(QueueName.PROCESS_VIDEO)
export class WorkerManager extends WorkerHost {
  private readonly logger: Logger = new Logger(WorkerManager.name);
  private readonly infos: WorkerInfo[] = [];

  constructor(
    @Inject(commonConfig.KEY) private appCommonConfig: CommonConfigType,
  ) {
    super();
    this.logger.log(`Attempting to allocate ${this.workerCountString}`);

    const fileName = this.workerFilename;
    for (let i = 0; i < this.appCommonConfig.workerCount; i += 1) {
      const worker = new Worker(fileName);
      this.infos.push({ worker, isBusy: false });
    }

    this.logger.log(`Successfully allocated ${this.workerCountString}`);

    /* If the main thread for some reason dies, take the workers with it */
    process.on('exit', () => {
      this.infos.forEach(async ({ worker }) => worker.terminate());
    });
  }

  private get workerCountString(): string {
    return `${this.appCommonConfig.workerCount} worker${this.appCommonConfig.workerCount === 1 ? '' : 's'}`;
  }

  private get workerFilename(): string {
    /**
     * There are 3 cases: running through `nest start`, running through
     * `ts-node` or `ts-jest`, and running after bundling.
     */
    if (__filename.endsWith('.ts')) {
      return resolve(__dirname, './workers/worker.ts');
    }
    if (existsSync(resolve(__dirname, './workers/worker.js'))) {
      return resolve(__dirname, './workers/worker.js');
    }
    return resolve(__dirname, './worker.js');
  }

  public async process(job: Job): Promise<void> {
    this.logger.log(`Processing job ${job.id}`);
  }
}
