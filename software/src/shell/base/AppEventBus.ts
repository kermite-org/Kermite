import { IAppWindowEvent } from '~defs/IpcContract';
import { TypedEventEmitter } from '~funcs/TypedEventEmitter';

interface TypedApplicationEvent {
  appWindowEvent: IAppWindowEvent;
}

// アプリケーションで扱うイベントを中継するためのEventEmitter
export const appEventBus = new TypedEventEmitter<TypedApplicationEvent>();
