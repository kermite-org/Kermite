import * as path from "path";
import * as fs from "fs-extra";
import * as childProcess from "child_process";
import { glob } from "glob";

const puts = console.log;

function exec(command: string) {
  childProcess.spawnSync(command, { shell: true });
}

const srcPicoSdkDir = ".tmp/pico-sdk";
const dstPicoSdkDir = "./pico_sdk";

function getSubFolderNamesInFolder(folderPath: string) {
  return fs
    .readdirSync(folderPath)
    .filter((it) => fs.lstatSync(path.join(folderPath, it)).isDirectory());
}

function getFileNamesInFolder(folderPath: string) {
  return fs
    .readdirSync(folderPath)
    .filter((it) => fs.lstatSync(path.join(folderPath, it)).isFile());
}

function extractSrcSubFoldersToDstFolder(relativeFolderPath: string) {
  const srcFolderPath = path.join(srcPicoSdkDir, relativeFolderPath);
  const dstFolderPath = path.join(dstPicoSdkDir, relativeFolderPath);
  fs.mkdirSync(dstFolderPath, { recursive: true });

  const subFolderNames = getSubFolderNamesInFolder(srcFolderPath);

  subFolderNames.forEach((subFolderName) => {
    fs.copySync(path.join(srcFolderPath, subFolderName), dstFolderPath);
  });
}

function flattenArray<T>(ar: T[][]): T[] {
  return ar.reduce((res, a) => [...res, ...a], []);
}

function uniqueArray<T>(ar: T[]): T[] {
  return ar.filter((a, idx) => ar.indexOf(a) === idx);
}
function countItemInArray<T>(ar: T[], value: T): number {
  return ar.filter((a) => a === value).length;
}

function filterConditionRemoveUnnecessarySources(fileName: string) {
  return !["CMakeLists.txt", "doc.h"].includes(fileName);
}

function extractSrcSubFoldersToDstFolderEx(relativeFolderPath: string) {
  const srcFolderPath = path.join(srcPicoSdkDir, relativeFolderPath);
  const dstFolderPath = path.join(dstPicoSdkDir, relativeFolderPath);
  fs.mkdirSync(dstFolderPath, { recursive: true });

  const moduleFolderNames = getSubFolderNamesInFolder(srcFolderPath);

  const allDestFileNames = flattenArray(
    moduleFolderNames.map((moduleFolderName) => {
      const moduleFolderPath = path.join(srcFolderPath, moduleFolderName);
      return getFileNamesInFolder(moduleFolderPath).filter(
        filterConditionRemoveUnnecessarySources
      );
    })
  );

  const overwrappingFileNames = uniqueArray(allDestFileNames).filter(
    (it) => countItemInArray(allDestFileNames, it) >= 2
  );
  // console.log({ dir: relativeFolderPath, overwrappingFileNames });

  moduleFolderNames.forEach((moduleFolderName) => {
    const moduleFolderPath = path.join(srcFolderPath, moduleFolderName);
    const fileNames = getFileNamesInFolder(moduleFolderPath).filter(
      filterConditionRemoveUnnecessarySources
    );
    fileNames.forEach((fileName) => {
      const srcPath = path.join(moduleFolderPath, fileName);
      const dstFileName = overwrappingFileNames.includes(fileName)
        ? `${
            path.basename(fileName).split(".")[0]
          }__${moduleFolderName}${path.extname(fileName)}`
        : fileName;
      const dstPath = path.join(dstFolderPath, dstFileName);
      fs.copySync(srcPath, dstPath);
    });

    const folderNames = getSubFolderNamesInFolder(moduleFolderPath);
    folderNames.forEach((folderName) => {
      const srcPath = path.join(moduleFolderPath, folderName);
      const dstPath = path.join(dstFolderPath, folderName);
      fs.copySync(srcPath, dstPath);
    });
  });
}

function copyFilesDirectUnder(relativeFolderPath) {
  const srcFolderPath = path.join(srcPicoSdkDir, relativeFolderPath);
  const dstFolderPath = path.join(dstPicoSdkDir, relativeFolderPath);
  fs.mkdirSync(dstFolderPath, { recursive: true });

  const fileNames = getFileNamesInFolder(srcFolderPath);

  fileNames.forEach((fileName) => {
    fs.copyFileSync(
      path.join(srcFolderPath, fileName),
      path.join(dstFolderPath, fileName)
    );
  });
}

function copyFolderRecursive(relativeFolderPath: string) {
  const srcFolderPath = path.join(srcPicoSdkDir, relativeFolderPath);
  const dstFolderPath = path.join(dstPicoSdkDir, relativeFolderPath);
  fs.copySync(srcFolderPath, dstFolderPath);
}

function removeFilesMatchTo(relativePatterns: string[]) {
  const patterns = relativePatterns.map((it) => path.join(dstPicoSdkDir, it));
  patterns.forEach((pattern) => {
    const filePaths = glob.sync(pattern);
    filePaths.forEach((filePath) => fs.unlinkSync(filePath));
  });
}

function copySingleFile(relativeFilePath: string) {
  const srcFilePath = path.join(srcPicoSdkDir, relativeFilePath);
  const dstFilePath = path.join(dstPicoSdkDir, relativeFilePath);
  fs.copySync(srcFilePath, dstFilePath);
}

function outputFile(relativeFilePath: string, content: string) {
  const dstFilePath = path.join(dstPicoSdkDir, relativeFilePath);
  fs.writeFileSync(dstFilePath, content, { encoding: "utf-8" });
}

function pullSdkSourceRepo() {
  puts("pull sdk repo ...");
  if (!fs.existsSync(srcPicoSdkDir)) {
    exec(`git clone https://github.com/raspberrypi/pico-sdk ${srcPicoSdkDir}`);
    exec(`cd ${srcPicoSdkDir} && git submodule update --init`);
  } else {
    exec(`cd ${srcPicoSdkDir} && git pull`);
    exec(`cd ${srcPicoSdkDir} && git submodule update`);
  }
  puts("pull sdk repo ... done");
}

const contentOfNoteText = [
  "import required code from pico-sdk",
  "https://github.com/raspberrypi/pico-sdk",
  "",
  "folder structure is arranged for easiness",
].join("\n");

function run() {
  process.chdir("../");

  pullSdkSourceRepo();

  puts("copy files ...");
  fs.rmdirSync(dstPicoSdkDir, { recursive: true });

  extractSrcSubFoldersToDstFolderEx("src/common");
  extractSrcSubFoldersToDstFolderEx("src/rp2_common");
  extractSrcSubFoldersToDstFolderEx("src/rp2040");

  copyFilesDirectUnder("lib/tinyusb/src");
  copyFolderRecursive("lib/tinyusb/src/class/hid");
  copyFolderRecursive("lib/tinyusb/src/common");
  copyFolderRecursive("lib/tinyusb/src/device");
  copyFolderRecursive("lib/tinyusb/src/osal");
  copyFolderRecursive("lib/tinyusb/src/portable/raspberrypi");

  removeFilesMatchTo(["**/*CMakeLists.txt", "**/*.svd", "**/*.py"]);

  copySingleFile("LICENSE.TXT");

  puts("copy files ... done");

  outputFile("note.txt", contentOfNoteText);
  puts("done");
}

run();
