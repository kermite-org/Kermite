import { getObjectKeys } from '~/shared/funcs/Utils';

export type IActionReceiver<T> = {
  [K in keyof T]?: (payload: NonNullable<T[K]>) => void | Promise<void>;
};

export class ActionDistributor<T> {
  receivers: IActionReceiver<T>[] = [];

  addReceivers(...receivers: IActionReceiver<T>[]) {
    this.receivers.push(...receivers);
  }

  async putAction(action: T): Promise<void> {
    const allKeys = getObjectKeys(action);
    for (const receiver of this.receivers) {
      for (const key of allKeys) {
        const res = receiver[key]?.(action[key]!);
        if (res instanceof Promise) {
          await res;
        }
      }
    }
  }
}
