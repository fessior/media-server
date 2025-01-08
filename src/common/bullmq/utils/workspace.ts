import { existsSync, mkdirSync, rmSync } from 'fs';
import { resolve } from 'path';

export function prepareWorkspace(
  baseDir: string,
  workspaceName: string,
): string {
  /**
   * Must use synchronous I/O to ensure each worker gets a unique workspace
   */
  const workspace = resolve(baseDir, workspaceName);
  if (existsSync(workspace)) {
    throw new Error(`Workspace ${workspace} already exists or is invalid`);
  }
  mkdirSync(workspace);
  return workspace;
}

export function cleanWorkspace(workspace: string): void {
  /**
   * Must use synchronous I/O to ensure each worker gets a unique workspace
   */
  rmSync(workspace, { recursive: true, force: true });
}
