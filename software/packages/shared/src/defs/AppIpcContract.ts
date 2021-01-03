export interface IAppIpcContract {
  sync: {
    getVersionSync(): string;
  };
  async: {
    getVersion(): Promise<string>;
    addNumber(a: number, b: number): Promise<number>;
  };
  events: {
    testEvent: { type: string };
  };
}
