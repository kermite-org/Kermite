export interface IListnerPort<T> {
  (listener: (payload: T) => void): void;
  emit(payload: T): void;
}

export function makeListnerPort<T>(): IListnerPort<T> {
  let listner: ((payload: T) => void) | undefined;
  const func = (_listner: (payload: T) => void) => {
    listner = _listner;
  };
  func.emit = (payload: T) => listner?.(payload);
  return func;
}
