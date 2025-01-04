declare global {
  interface ProcessEnv {
    NODE_ENV: string;
    PORT: string;
    MAX_WORKER_COUNT: string;
  }
}

export {};
