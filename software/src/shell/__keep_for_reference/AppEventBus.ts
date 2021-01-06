import { IAppWindowEvent } from '~shared/defs/IpcContract';
import { EventPort } from '~shared/funcs/EventPort';

// ウインドウに関するイベントを中継するためのEventPort
export const appWindowEventHub = new EventPort<IAppWindowEvent>();
