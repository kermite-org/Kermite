import { IUiRealtimeKeyboardEventProvider } from '../interfaces/IRealtimeKeyboardEventProvider';
import { IRealtimeKeyboardEvent } from '~defs/ipc';

type IRealtimetimeKeyboardEventListener = (
  event: IRealtimeKeyboardEvent
) => void;

export class RealtimeKeyboardEventProvider_DomKeyboardSimulator
  implements IUiRealtimeKeyboardEventProvider {
  //private keyToKeyIndexMapStr = 'qwertyuiopasdfghjkl;zxcvbnm,./';
  private keyToKeyIndexMapStr = 'qwerasdfzxcv';

  private listener!: IRealtimetimeKeyboardEventListener;

  setListener(listener: IRealtimetimeKeyboardEventListener) {
    this.listener = listener;
  }

  private getKeyIndexByKey(key: string): number | undefined {
    const res = this.keyToKeyIndexMapStr.indexOf(key);
    return res !== -1 ? res : undefined;
  }

  private handleKeyEvent = (e: KeyboardEvent) => {
    if (!e.repeat) {
      const keyIndex = this.getKeyIndexByKey(e.key);
      const isDown = e.type === 'keydown';
      if (keyIndex !== undefined) {
        this.listener({ type: 'keyStateChanged', keyIndex, isDown });
      }
    }
  };

  start() {
    window.addEventListener('keydown', this.handleKeyEvent);
    window.addEventListener('keyup', this.handleKeyEvent);
  }

  stop() {
    window.removeEventListener('keydown', this.handleKeyEvent);
    window.removeEventListener('keyup', this.handleKeyEvent);
  }
}
