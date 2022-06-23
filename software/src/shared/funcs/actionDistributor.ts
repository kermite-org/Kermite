import { getObjectKeys } from '~/shared/funcs/utils';

export type IActionReceiver<T> = {
  [K in keyof T]?: (payload: NonNullable<T[K]>) => void | Promise<void>;
};

export class ActionDistributor<T extends {}> {
  receivers: IActionReceiver<T>[] = [];

  addReceivers(...receivers: IActionReceiver<T>[]) {
    this.receivers.push(...receivers);
  }

  async putAction(action: T): Promise<void> {
    const allKeys = getObjectKeys(action);

    for (const key of allKeys) {
      let handled = false;
      for (const receiver of this.receivers) {
        const handler = receiver[key];
        if (handler) {
          const res = handler(action[key]!);
          if (res instanceof Promise) {
            await res;
          }
          handled = true;
        }
      }
      if (!handled) {
        console.log(`no action handler found for ${key as any} `);
      }
    }
  }
}
