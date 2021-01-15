export interface IIpcContractBase {
  sync: {
    [key in string]: (...args: any[]) => any | undefined;
  };
  async: {
    [key in string]: (...args: any[]) => Promise<any | undefined>;
  };
  events: {
    [key in string]: any;
  };
}
