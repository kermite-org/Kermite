import { rerender } from 'qx';
import { debounce, getIpcRendererAgent, IAppIpcContract } from '~/shared';

export const ipcAgent = getIpcRendererAgent<IAppIpcContract>();
// キーイベントをUIの複数箇所から購読した場合に、再描画が購読した箇所の個数分走る問題がある
// debouceでこれを回避
ipcAgent.setPropsProcessHook(debounce(rerender, 20));
