import { Inject, Logger } from '@nestjs/common';
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
       * TODO(qhung312): Find a way to not hardcode this path, as it can only be
       * run by `yarn build` -> `node dist/main.js` right now.
       */
      const worker = new Worker('./dist/workers/worker.js');
      this.infos.push({ worker, isBusy: false });
    }

    this.logger.log(`Successfully allocated ${this.workerCountString}`);
  }

  private get workerCountString(): string {
    return `${this.appCommonConfig.workerCount} worker${this.appCommonConfig.workerCount === 1 ? '' : 's'}`;
  }
}
