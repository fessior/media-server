import { Logger } from '@nestjs/common';

import { bootstrapMainServer } from './app';
import { commonConfig, CommonConfigType } from './common/config/common.config';

const logger = new Logger('Application Bootstrap');

async function startApplication(): Promise<void> {
  const app = await bootstrapMainServer();
  const port: number = app.get<CommonConfigType>(
    commonConfig.KEY,
  ).mainServerPort;

  logger.log(`Attempting to start main server on port ${port}`);

  await app.listen(port);

  logger.log(`Main server started successfully`);
}

startApplication()
  .then(() => {
    logger.log('Startup successful!');
  })
  .catch(error => {
    logger.error('Startup failed', error);
  });
