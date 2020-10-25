import { removeArrayItems } from '~funcs/Utils';

type IStatusListener<T> = (partialStatus: Partial<T>) => void;

export class StatusSource<T> {
  private status: T;
  private listeners: IStatusListener<T>[] = [];

  constructor(status: T) {
    this.status = status;
  }

  getStatus(): T {
    return this.status;
  }

  set(partialStatus: Partial<T>) {
    this.status = { ...this.status, ...partialStatus };
    this.listeners.forEach((li) => li(partialStatus));
  }

  subscribe(listener: IStatusListener<T>) {
    listener(this.status);
    this.listeners.push(listener);
  }

  unsubscribe(listener: IStatusListener<T>) {
    removeArrayItems(this.listeners, listener);
  }
}
