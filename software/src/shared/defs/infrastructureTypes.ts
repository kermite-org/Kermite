export type IFileHandleBase = {
  // name: FileSystemFileHandle['name'];
  getFile(): Promise<Pick<File, 'name'>>;
};

export type IFileReadHandle = {
  getFile(): Promise<Pick<File, 'name' | 'text'>>;
};

export type IFileWriteHandle = {
  getFile(): Promise<Pick<File, 'name'>>;
  createWritable: FileSystemFileHandle['createWritable'];
};
