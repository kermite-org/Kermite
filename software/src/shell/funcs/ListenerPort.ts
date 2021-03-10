import { removeArrayItems } from '~/shared';

type IListener<T> = (payload: T) => void;
export interface IListenerPortImpl<T> {
  (listener: IListener<T>): () => void;
  emit(payload: T): void;
  purge(): void;
  remove(listener: IListener<T>): void;
}

export function makeListenerPort<T>(): IListenerPortImpl<T> {
  let listeners: IListener<T>[] = [];
  const func = (listener: IListener<T>): (() => void) => {
    listeners.push(listener);
    return () => removeArrayItems(listeners, listener);
  };
  func.emit = (payload: T) => {
    listeners.forEach((listener) => listener(payload));
  };
  func.purge = () => {
    listeners = [];
  };
  func.remove = (listener: IListener<T>) => {
    removeArrayItems(listeners, listener);
  };
  return func;
}
