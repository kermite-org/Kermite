import { getObjectKeys } from '~/shared/funcs/Utils';

export type IActionReceiver<T> = {
  [K in keyof T]?: (payload: NonNullable<T[K]>) => void;
};

export class ActionDistributor<T> {
  receivers: IActionReceiver<T>[] = [];

  addReceiver(receiver: IActionReceiver<T>) {
    this.receivers.push(receiver);
  }

  putAction(action: T) {
    this.receivers.forEach((receiver) => {
      getObjectKeys(action).forEach((key) => receiver[key]?.(action[key]!));
    });
  }
}
