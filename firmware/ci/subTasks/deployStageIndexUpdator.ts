import {
  compareObjectByJsonStringifyParse,
  createObjectFromKeyValues,
  fsExistsSync,
  fsStatSync,
  fsxReadJsonFile,
  fsxReadTextFile,
  fsxWriteJsonFile,
  generateMd5,
  globSync,
  pathRelative,
  puts,
  timeNow,
} from "../helpers";

type IFilesMd5Dict = { [key in string]: string };

interface IIndexJsonData {
  updatedAt: string;
  filesRevision: number;
  files: IFilesMd5Dict;
}

function loadSourceIndex(): IIndexJsonData {
  const indexFilePath = "./KRS/resources2/index.json";
  if (fsExistsSync(indexFilePath)) {
    return fsxReadJsonFile(indexFilePath);
  }
  return {
    updatedAt: "",
    filesRevision: 0,
    files: {},
  };
}

function makeFilesMd5Dict(): IFilesMd5Dict {
  const filePaths = globSync("./dist/**/*").filter((f) =>
    fsStatSync(f).isFile()
  );
  return createObjectFromKeyValues(
    filePaths.map((filePath) => {
      const relPath = pathRelative("./dist", filePath);
      const content = fsxReadTextFile(filePath);
      const md5 = generateMd5(content);
      return [relPath, md5];
    })
  );
}

function makeIndexJsonContent(
  revision: number,
  filesMd5Dict: IFilesMd5Dict,
  updatedAt: string
): IIndexJsonData {
  return {
    updatedAt,
    filesRevision: revision,
    files: filesMd5Dict,
  };
}

interface IIndexUpdatorResult {
  filesChanged: boolean;
  filesRevision: number;
}

export function deployStageIndexUpdator_updateIndexIfFilesChanged(): IIndexUpdatorResult {
  const sourceIndex = loadSourceIndex();
  const filesMd5Dict = makeFilesMd5Dict();

  const filesChanged = !(
    sourceIndex &&
    compareObjectByJsonStringifyParse(sourceIndex.files, filesMd5Dict)
  );

  puts(`filesChanged: ${filesChanged}`);

  const { filesRevision } = sourceIndex;

  if (filesChanged) {
    puts(`filesRevision: ${filesRevision} --> ${filesRevision + 1}`);
    const savingIndexObj = makeIndexJsonContent(
      filesRevision + 1,
      filesMd5Dict,
      timeNow()
    );
    fsxWriteJsonFile("./dist/index.json", savingIndexObj);
  } else {
    puts(`filesRevision: ${filesRevision}`);
    fsxWriteJsonFile("./dist/index.json", sourceIndex);
  }

  return { filesChanged, filesRevision };
}
