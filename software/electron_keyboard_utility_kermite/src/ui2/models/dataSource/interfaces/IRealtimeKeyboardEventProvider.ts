export interface IUiRealtimeKeyboardEvent {
  keyIndex: number;
  isDown: boolean;
}

export interface IUiRealtimeKeyboardEventProvider {
  setListener(listener: (event: IUiRealtimeKeyboardEvent) => void): void;
  start(): void;
  stop(): void;
}
