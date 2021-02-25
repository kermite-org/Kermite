import { removeArrayItems } from '~/shared';

type IEventListener<T> = (event: T) => void;
export interface IEventPort<T> {
  subscribe(listener: IEventListener<T>): () => void;
  unsubscribe(listener: IEventListener<T>): void;
  emit(event: T): void;
}

export function createEventPort<T>(
  options: {
    initialValueGetter?: () => T;
    onFirstSubscriptionStarting?: () => void;
    onLastSubscriptionEnded?: () => void;
  } = {},
): IEventPort<T> {
  const {
    initialValueGetter,
    onFirstSubscriptionStarting,
    onLastSubscriptionEnded,
  } = options;

  const listeners: IEventListener<T>[] = [];

  const unsubscribe = (listener: IEventListener<T>) => {
    removeArrayItems(listeners, listener);
    if (listeners.length === 0) {
      onLastSubscriptionEnded?.();
    }
  };

  const subscribe = (listener: IEventListener<T>) => {
    if (listeners.length === 0) {
      onFirstSubscriptionStarting?.();
    }
    if (initialValueGetter) {
      listener(initialValueGetter());
    }
    listeners.push(listener);
    return () => unsubscribe(listener);
  };

  const emit = (event: T) => {
    listeners.forEach((li) => li(event));
  };

  return {
    subscribe,
    unsubscribe,
    emit,
  };
}
