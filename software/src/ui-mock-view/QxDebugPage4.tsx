import { FC, jsx, useState } from 'qx';

type IContextProvider<T> = FC<{ value: T; children: any }>;

type IContext<T> = {
  value: T;
  Provider: IContextProvider<T>;
};

function createContext<T>(defaultValue: T): IContext<T> {
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

function useContext<T>(context: IContext<T>): T {
  return context.value;
}

// ----------

type ICountContextValue = {
  count: number;
  increment(): void;
};
const CountContext = createContext<ICountContextValue>({} as any);
const useCountContext = () => useContext(CountContext);

function useCountContextValue(): ICountContextValue {
  const [count, setCount] = useState(0);
  return {
    count,
    increment: () => setCount((prev) => prev + 1),
  };
}

const CountView: FC = () => {
  const { count, increment } = useCountContext();
  return <div onClick={increment}>{count}</div>;
};

const ContextApiDevelopment: FC = () => {
  const countContextValue = useCountContextValue();
  const countContextValue2 = useCountContextValue();
  return (
    <div>
      <CountContext.Provider value={countContextValue}>
        <CountView />
      </CountContext.Provider>
      <CountContext.Provider value={countContextValue}>
        <CountView />
      </CountContext.Provider>
      <CountContext.Provider value={countContextValue2}>
        <CountView />
      </CountContext.Provider>
    </div>
  );
};

export const QxDebugPage4: FC = () => {
  return <ContextApiDevelopment />;
};
