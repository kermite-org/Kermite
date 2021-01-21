import { removeArrayItems } from '~/shared';

type IListener<T> = (payload: T) => void;
interface IListenerPortImpl<T> {
  (listener: IListener<T>): () => void;
  emit(payload: T): void;
}

export function makeListenerPort<T>(): IListenerPortImpl<T> {
  const listeners: IListener<T>[] = [];
  const func = (listener: IListener<T>): (() => void) => {
    listeners.push(listener);
    return () => removeArrayItems(listeners, listener);
  };
  func.emit = (payload: T) => {
    listeners.forEach((listener) => listener(payload));
  };
  return func;
}
