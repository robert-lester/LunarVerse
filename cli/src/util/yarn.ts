import * as exec from './exec';
import * as walk from './walk';

export async function install(handler?: any, shouldRemoveNodeModules: boolean = false, shouldRemoveYarnLock = false): Promise<void> {
  const dirs: string[] = walk.directories(process.cwd());
  for(let x = 0; x < dirs.length; x++) {
    const dir: string = dirs[x];
    const command: string = `cd ${dir}${shouldRemoveNodeModules ? ' && rm -rf node_modules' : ''}${shouldRemoveYarnLock ? ' && rm yarn.lock' : ''} && yarn`;
    await exec.promise(command, true, handler);
  }
}

export async function upgrade(handler?: any, shouldRemoveNodeModules: boolean = false, shouldRemoveYarnLock = false): Promise<void> {
  const dirs: string[] = walk.directories(process.cwd());
  for(let x = 0; x < dirs.length; x++) {
    const dir: string = dirs[x];
    const command: string = `cd ${dir}${shouldRemoveNodeModules ? ' && rm -rf node_modules' : ''}${shouldRemoveYarnLock ? ' && rm yarn.lock' : ''} && yarn upgrade`;
    await exec.promise(command, true, handler);
  }
}