export type IFileHandleBase = {
  // name: FileSystemFileHandle['name'];
  getFile(): Promise<Pick<File, 'name'>>;
};

export type IFileReadHandle = {
  fileName: string;
  contentText: string;
};

export type IFileWriteHandle = {
  getFile(): Promise<Pick<File, 'name'>>;
  createWritable: FileSystemFileHandle['createWritable'];
};
