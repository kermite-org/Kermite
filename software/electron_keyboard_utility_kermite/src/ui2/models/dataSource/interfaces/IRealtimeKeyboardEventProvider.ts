import { IRealtimeKeyboardEvent } from '~defs/ipc';

export interface IUiRealtimeKeyboardEventProvider {
  setListener(listener: (event: IRealtimeKeyboardEvent) => void): void;
  start(): void;
  stop(): void;
}
