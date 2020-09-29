import { TypedEventEmitter } from '~funcs/TypedEventEmitter';
import { IAppWindowEvent } from '~defs/IpcContract';

interface TypedApplicationEvent {
  appWindowEvent: IAppWindowEvent;
}

export const appEventBus = new TypedEventEmitter<TypedApplicationEvent>();
