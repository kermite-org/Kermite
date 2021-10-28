import { IVNode } from 'qx/qxinternal_qxcore/types';

type IContextProvider<T> = (props: { value: T; children: any }) => IVNode;

type IContext<T> = {
  value: T;
  Provider: IContextProvider<T>;
};

export function createContext<T>(defaultValue: T): IContext<T> {
  let sourceValue = defaultValue;
  return {
    get value() {
      return sourceValue;
    },
    Provider: ({ value, children }) => {
      sourceValue = value;
      return children[0];
    },
  };
}

export function useContext<T>(context: IContext<T>): T {
  return context.value;
}
