import * as childProcess from 'child_process';

export async function executeShellCommandAsync(
  command: string,
): Promise<string> {
  return await new Promise((resolve, reject) => {
    childProcess.exec(command, (err, stdout) => {
      if (!err) {
        resolve(stdout);
      } else {
        reject(err);
      }
    });
  });
}
