import { IUiRealtimeKeyboardEventProvider } from './interfaces/IRealtimeKeyboardEventProvider';
import { backendAgent } from '~ui/models/dataSource/ipc';
import { IRealtimeKeyboardEvent } from '~defs/IpcContract';

type IUiRealtimetimeKeyboardEventListener = (
  event: IRealtimeKeyboardEvent
) => void;

export class RealtimeKeyboardEventProvider_RealDevice
  implements IUiRealtimeKeyboardEventProvider {
  private listener!: IUiRealtimetimeKeyboardEventListener;

  setListener(listener: IUiRealtimetimeKeyboardEventListener) {
    this.listener = listener;
  }

  private handleKeyEvent = (ev: IRealtimeKeyboardEvent) => {
    this.listener(ev);
  };

  start() {
    backendAgent.keyEvents.subscribe(this.handleKeyEvent);
  }

  stop() {
    backendAgent.keyEvents.unsubscribe(this.handleKeyEvent);
  }
}
