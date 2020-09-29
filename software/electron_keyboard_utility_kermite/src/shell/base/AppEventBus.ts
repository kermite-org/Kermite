import { TypedEventEmitter } from '~funcs/TypedEventEmitter';
import { IAppWindowEvent } from '~defs/IpcContract';

interface TypedApplicationEvent {
  appWindowEvent: IAppWindowEvent;
}

// アプリケーションで扱うイベントを中継するためのEventEmitter
export const appEventBus = new TypedEventEmitter<TypedApplicationEvent>();
