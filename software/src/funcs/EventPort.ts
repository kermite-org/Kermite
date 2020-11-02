import { removeArrayItems } from '~funcs/Utils';

type IEventListener<T> = (event: T) => void;

export class EventPort<T> {
  private listeners: IEventListener<T>[] = [];

  emit(event: T) {
    this.listeners.forEach((li) => li(event));
  }

  subscribe = (listener: IEventListener<T>) => {
    this.listeners.push(listener);
  };

  unsubscribe = (listener: IEventListener<T>) => {
    removeArrayItems(this.listeners, listener);
  };
}
