import { backendAgent } from '~ui/core/ipc';
import { IRealtimeKeyboardEvent } from '~defs/IpcContract';

type IUiRealtimetimeKeyboardEventListener = (
  event: IRealtimeKeyboardEvent
) => void;

export class RealtimeKeyboardEventProvider {
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