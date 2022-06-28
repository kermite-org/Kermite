import * as fs from "fs";
import * as childProcess from "child_process";
import * as crypto from "crypto";
import * as fsExtra from "fs-extra";
import * as glob from "glob";
import * as path from "path";

export function fsxReadTextFile(fpath: string) {
  return fs.readFileSync(fpath, { encoding: "utf-8" });
}

export function fsxWriteTextFile(fpath: string, content: string) {
  return fs.writeFileSync(fpath, content, { encoding: "utf-8" });
}

export function fsxReadJsonFile(fpath: string) {
  const content = fs.readFileSync(fpath, { encoding: "utf-8" });
  return JSON.parse(content);
}

export function fsxWriteJsonFile(fpath: string, obj: any) {
  const text = JSON.stringify(obj, null, "  ");
  fs.writeFileSync(fpath, text, { encoding: "utf-8" });
}

export function executeCommand(
  command: string
): [string, string, number | null] {
  const res = childProcess.spawnSync(command, { shell: true });
  return [res.stdout.toString(), res.stderr.toString(), res.status];
}

export function execueteOneliner(command: string) {
  const res = childProcess.spawnSync(command, { shell: true });
  return res.stdout.toString().trim();
}

export function generateMd5(str: string) {
  return crypto.createHash("md5").update(str).digest("hex");
}

export function timeNow(): string {
  return new Date().toISOString();
}

export function fsxCopyDirectory(src: string, dst: string) {
  fsExtra.copySync(src, dst);
}

export function fsxMakeDirectory(fpath: string) {
  if (!fs.existsSync(fpath)) {
    fs.mkdirSync(fpath, { recursive: true });
  }
}

export const fsCopyFileSync = fs.copyFileSync;

export const globSync = glob.sync;

export const pathDirname = path.dirname;

export const pathBasename = path.basename;

export const pathJoin = path.join;

export const pathResolve = path.resolve;

export const pathRelative = path.relative;

export const fsExistsSync = fs.existsSync;

export const fsRmSync = fs.rmSync;

export const fsStatSync = fs.statSync;

export const fsReaddirSync = fs.readdirSync;

export function fsxListFileBaseNames(
  folderPath: string,
  extension: string
): string[] {
  if (fsExistsSync(folderPath)) {
    return fsReaddirSync(folderPath)
      .filter((fileName) => fileName.endsWith(extension))
      .map((fileName) => pathBasename(fileName, extension));
  } else {
    return [];
  }
}
