import { IRealtimeKeyboardEvent } from '~defs/IpcContract';

export interface IUiRealtimeKeyboardEventProvider {
  setListener(listener: (event: IRealtimeKeyboardEvent) => void): void;
  start(): void;
  stop(): void;
}
