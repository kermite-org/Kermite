export type IListenerPort<T> = (listener: (payload: T) => void) => () => void;

export type IListenerPortS<T> = {
  subscribe: (listener: (payload: T) => void) => () => void;
};
