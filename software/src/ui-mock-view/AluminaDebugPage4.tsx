import { createContext, FC, jsx, useContext, useState } from 'alumina';

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

export const AluminaDebugPage4: FC = () => {
  return <ContextApiDevelopment />;
};
