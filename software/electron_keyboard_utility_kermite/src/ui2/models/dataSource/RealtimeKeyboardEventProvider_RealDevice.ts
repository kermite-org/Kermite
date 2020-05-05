import {
  IUiRealtimeKeyboardEventProvider,
  IUiRealtimeKeyboardEvent
} from './interfaces/IRealtimeKeyboardEventProvider';
import { backendAgent } from '~ui2/models/ipc';
import { IRealtimeKeyboardEvent } from '~defs/ipc';

type IUiRealtimetimeKeyboardEventListener = (
  event: IUiRealtimeKeyboardEvent
) => void;

export class RealtimeKeyboardEventProvider_RealDevice
  implements IUiRealtimeKeyboardEventProvider {
  private listener!: IUiRealtimetimeKeyboardEventListener;

  setListener(listener: IUiRealtimetimeKeyboardEventListener) {
    this.listener = listener;
  }

  private handleKeyEvent = (ev: IRealtimeKeyboardEvent) => {
    if (ev.type === 'keyStateChanged') {
      const { keyIndex, isDown } = ev;
      this.listener({ keyIndex, isDown });
    }
  };

  start() {
    backendAgent.keyEvents.subscribe(this.handleKeyEvent);
  }

  stop() {
    backendAgent.keyEvents.unsubscribe(this.handleKeyEvent);
  }
}
