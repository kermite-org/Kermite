import { getIpcRendererAgent, IAppIpcContract } from '@kermite/shared';
import { rerender } from 'qx';

export const ipcAgent = getIpcRendererAgent<IAppIpcContract>();
ipcAgent.setPropsProcessHook(rerender);
