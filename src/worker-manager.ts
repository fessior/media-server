import { Inject, Logger } from '@nestjs/common';
import { resolve } from 'path';
import { Worker } from 'worker_threads';

import { commonConfig, CommonConfigType } from './common/config';

type WorkerInfo = {
  worker: Worker;
  isBusy: boolean;
  lastFinishedAt?: Date;
};

/**
 * Handles the allocation and deallocation of worker threads, and finding a free
 * worker thread to assign to work to.
 */
export class WorkerManager {
  private readonly logger: Logger = new Logger(WorkerManager.name);
  private readonly infos: WorkerInfo[] = [];

  constructor(
    @Inject(commonConfig.KEY) private appCommonConfig: CommonConfigType,
  ) {
    this.logger.log(`Attempting to allocate ${this.workerCountString}`);

    for (let i = 0; i < this.appCommonConfig.workerCount; i += 1) {
      /**
       * If we're running via ts-jest, the worker file will be in a different
       * location than when we compile via Webpack. This is a workaround for it
       */
      const filename =
        process.env.JEST_WORKER_ID !== undefined
          ? resolve(__dirname, './workers/worker.ts')
          : resolve(__dirname, './worker.js');
      const worker = new Worker(filename);
      this.infos.push({ worker, isBusy: false });
    }

    this.logger.log(`Successfully allocated ${this.workerCountString}`);
  }

  private get workerCountString(): string {
    return `${this.appCommonConfig.workerCount} worker${this.appCommonConfig.workerCount === 1 ? '' : 's'}`;
  }
}
