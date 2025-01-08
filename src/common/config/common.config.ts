import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

export type NodeEnv = 'local' | 'development' | 'production';

type CommonConfig = {
  nodeEnv: NodeEnv;

  mainServerPort: number;

  /**
   * Redis connection details
   */
  redisHost: string;
  redisPort: number;

  /**
   * Workspace for processing media files
   */
  mediaWorkdir: string;
};

export const commonConfig = registerAs('common', () => {
  const configValues: CommonConfig = {
    nodeEnv: <NodeEnv>process.env.NODE_ENV,
    mainServerPort: parseInt(<string>process.env.PORT, 10) || 3000,
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(<string>process.env.REDIS_PORT, 10) || 6379,
    mediaWorkdir: <string>process.env.MEDIA_WORKDIR,
  };

  const validationSchema = z.object({
    nodeEnv: z.enum(['local', 'development', 'production']),
    mainServerPort: z.number().int().positive(),
    redisHost: z.string(),
    redisPort: z.number().int().positive(),
    mediaWorkdir: z.string(),
  });

  validationSchema.parse(configValues);

  return configValues;
});

export type CommonConfigType = ConfigType<typeof commonConfig>;
