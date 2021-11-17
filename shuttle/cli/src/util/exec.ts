import * as child from 'child_process';
import * as Types from '../@types/util/exec';

// Helper function for promisify-ing exec()
export function promise (command: string, shouldHandleOutput: boolean = false, handler?: Types.Handler): Promise<Types.Exec> {
  return new Promise((resolve, reject) => {
    const terminal = child.exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
    if (shouldHandleOutput) {
      if (handler) {
        terminal.stdout.setEncoding('utf8');
        terminal.stdout.on('data', handler.stdout);
        terminal.stderr.on('data', handler.stderr);
      } else {
        terminal.stdout.setEncoding('utf8');
        terminal.stdout.on('data', chunk => console.log(chunk));
        terminal.stderr.on('data', chunk => console.error(chunk));
      }
    }
  });
}