interface IQxGlobal {
  rerender: () => void;
  asyncRerenderFlag: boolean;
  hookEffectFuncs: (() => void)[];
  debug: {
    nAll: number;
    nUpdated: number;
    nPatchCall: number;
  };
}

export const qxGlobal: IQxGlobal = {
  rerender: () => {},
  asyncRerenderFlag: false,
  hookEffectFuncs: [],

  debug: {
    nAll: 0,
    nUpdated: 0,
    nPatchCall: 0,
  },
};
