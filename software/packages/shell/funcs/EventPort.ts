import { removeArrayItems } from '@kermite/shared';

type IEventListener<T> = (event: T) => void;

export class EventPort<T> {
  private listeners: IEventListener<T>[] = [];

  emit(event: T) {
    this.listeners.forEach((li) => li(event));
  }

  private initialValueGetter: (() => T) | undefined;

  constructor(options?: { initialValueGetter: () => T }) {
    this.initialValueGetter = options?.initialValueGetter;
  }

  subscribe = (listener: IEventListener<T>) => {
    this.listeners.push(listener);

    if (this.initialValueGetter) {
      listener(this.initialValueGetter());
    }
  };

  unsubscribe = (listener: IEventListener<T>) => {
    removeArrayItems(this.listeners, listener);
  };
}
