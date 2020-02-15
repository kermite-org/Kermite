import {
  IpcPacket,
  IBackendAgent,
  IProfileManagerCommand,
  IWindowManagerCommand
} from '~contract/ipc';
import { createXpcRenderer } from '~funcs/xpc/xpcRenderer';
import { IpcRenderer } from 'electron';

const ipcRenderer: IpcRenderer = (window as any).ipcRenderer;

export function sendIpcPacketSync(packet: IpcPacket) {
  ipcRenderer.sendSync('message', packet);
}

export function sendIpcPacket(packet: IpcPacket) {
  ipcRenderer.send('message', packet);
}

export function debugTrace(message: string) {
  sendIpcPacketSync({ debugMessage: message });
}

const xpcRenderer = createXpcRenderer((window as any).ipcRenderer);
export const backendAgent = xpcRenderer.getBackendAgent<IBackendAgent>(
  'default'
);

export function sendProfileManagerCommands(
  ...commands: (IProfileManagerCommand | undefined)[]
) {
  ipcRenderer.send(
    'profileManagerCommands',
    commands.filter(c => c !== undefined)
  );
}

export function sendWindowManagerCommand(cmd: IWindowManagerCommand) {
  ipcRenderer.send('windowManagerCommand', cmd);
}
