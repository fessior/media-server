import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { existsSync, mkdirSync } from 'fs';

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

  /* Create workdir for workers */
  if (!existsSync(appCommonConfig.mediaWorkdir)) {
    logger.log(`Creating workdir at ${appCommonConfig.mediaWorkdir}`);
    mkdirSync(appCommonConfig.mediaWorkdir);
  }
}

startApplication()
  .then(() => {
    logger.log('Startup successful!');
  })
  .catch(error => {
    logger.error('Startup failed', error);
  });
