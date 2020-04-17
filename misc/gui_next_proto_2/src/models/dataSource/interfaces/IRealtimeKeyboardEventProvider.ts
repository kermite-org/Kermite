export interface IRealtimeKeyboardEvent {
  keyIndex: number;
  isDown: boolean;
}

export interface IRealtimeKeyboardEventProvider {
  setListener(listener: (event: IRealtimeKeyboardEvent) => void): void;
  start(): void;
  stop(): void;
}
