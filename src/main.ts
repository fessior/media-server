import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { commonConfig, CommonConfigType } from './common/config/common.config';

const logger = new Logger('Bootstrap');

async function startApplication(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  const appCommonConfig = app.get<CommonConfigType>(commonConfig.KEY);
  const { mainServerPort: port } = appCommonConfig;

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
