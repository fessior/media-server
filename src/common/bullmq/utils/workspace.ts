import { existsSync, mkdirSync, rmSync } from 'fs';
import { resolve } from 'path';

export function prepareWorkspace(
  baseDir: string,
  workspaceName: string,
): string {
  const workspace = resolve(baseDir, workspaceName);
  if (existsSync(workspace)) {
    throw new Error(`Workspace ${workspace} already exists or is invalid`);
  }
  mkdirSync(workspace);
  return workspace;
}

export function cleanWorkspace(workspace: string): void {
  rmSync(workspace, { recursive: true, force: true });
}
