import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

export type NodeEnv = 'local' | 'development' | 'production';

type CommonConfig = {
  nodeEnv: NodeEnv;

  /**
   * Port that the main server listens on. Workers only receive requests from
   * the main server through message passing, so it's irrelevant to them
   */
  mainServerPort: number;

  /**
   * Number of workers to spawn. All workers are spawned at once on server start
   */
  workerCount: number;
};

export const commonConfig = registerAs('common', () => {
  const configValues: CommonConfig = {
    nodeEnv: <NodeEnv>process.env.NODE_ENV,
    mainServerPort: parseInt(<string>process.env.PORT, 10) || 3000,
    workerCount: parseInt(<string>process.env.WORKER_COUNT, 10) || 5,
  };

  const validationSchema = z.object({
    nodeEnv: z.enum(['local', 'development', 'production']),
    mainServerPort: z.number().int().positive(),
    workerCount: z.number().int().positive(),
  });

  validationSchema.parse(configValues);

  return configValues;
});

export type CommonConfigType = ConfigType<typeof commonConfig>;
