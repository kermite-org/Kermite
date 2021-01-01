export type IEventListener<T> = (arg: T) => void;

export type IEventSource<T> = {
  subscribe(listener: IEventListener<T>): void;
  unsubscribe(listener: IEventListener<T>): void;
};
