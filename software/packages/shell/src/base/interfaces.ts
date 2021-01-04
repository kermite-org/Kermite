export type IListenerPort<T> = (listener: (payload: T) => void) => void;
