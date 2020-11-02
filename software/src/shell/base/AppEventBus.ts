import { IAppWindowEvent } from '~defs/IpcContract';
import { EventPort } from '~funcs/EventPort';

// ウインドウに関するイベントを中継するためのEventPort
export const appWindowEventHub = new EventPort<IAppWindowEvent>();
