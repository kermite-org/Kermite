export type IFileReadHandle = {
  fileName: string;
  contentText: string;
};

export type IFileWriteHandle = {
  fileName: string;
  save(contentText: string): Promise<void>;
};
