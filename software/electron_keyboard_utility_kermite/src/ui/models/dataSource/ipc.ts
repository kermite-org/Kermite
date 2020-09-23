import { ISynchronousIpcPacket, IBackendAgent } from '~defs/IpcContract';
import { createXpcRenderer } from '~lib/xpc/xpcRenderer';
import { IpcRenderer } from 'electron';

const ipcRenderer: IpcRenderer = (window as any).ipcRenderer;

export function sendIpcPacketSync(packet: ISynchronousIpcPacket) {
  ipcRenderer.sendSync('synchronousMessage', packet);
}

export function debugTrace(message: string) {
  sendIpcPacketSync({ debugMessage: message });
}

const xpcRenderer = createXpcRenderer((window as any).ipcRenderer);

export const backendAgent = xpcRenderer.getBackendAgent<IBackendAgent>(
  'default'
);
