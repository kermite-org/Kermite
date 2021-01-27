import { removeArrayItems } from '~/shared';

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

export interface IEventPort2<T> {
  subscribe(listener: IEventListener<T>): () => void;
  emit(event: T): void;
}

export function createEventPort2<T>(options: {
  initialValueGetter?: () => T;
  onFirstSubscriptionStarting?: () => void;
  onLastSubscriptionEnded?: () => void;
}): IEventPort2<T> {
  const {
    initialValueGetter,
    onFirstSubscriptionStarting,
    onLastSubscriptionEnded,
  } = options;

  const listeners: IEventListener<T>[] = [];

  const subscribe = (listener: IEventListener<T>) => {
    if (listeners.length === 0) {
      onFirstSubscriptionStarting?.();
    }
    if (initialValueGetter) {
      listener(initialValueGetter());
    }
    listeners.push(listener);
    return () => {
      removeArrayItems(listeners, listener);
      if (listeners.length === 0) {
        onLastSubscriptionEnded?.();
      }
    };
  };

  const emit = (event: T) => {
    listeners.forEach((li) => li(event));
  };

  return {
    subscribe,
    emit,
  };
}
