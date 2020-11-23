import * as fs from "fs";
import * as childProcess from "child_process";

export function fsxReadTextFile(fpath: string) {
  return fs.readFileSync(fpath, { encoding: "utf-8" });
}

export function fsxReadJsonFile(fpath: string) {
  const content = fs.readFileSync(fpath, { encoding: "utf-8" });
  return JSON.parse(content);
}

export function executeCommand(
  command: string
): [string, string, number | null] {
  const res = childProcess.spawnSync(command, { shell: true });
  return [res.stdout.toString(), res.stderr.toString(), res.status];
}
