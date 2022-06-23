import { asyncRerender } from 'alumina';
import { debounce } from '~/shared';
import { appGlobal } from '~/shell/base';

export const ipcAgent = appGlobal.ipcMainAgent;

// export const ipcAgent = getIpcRendererAgent<IAppIpcContract>();
// キーイベントをUIの複数箇所から購読した場合に、再描画が購読した箇所の個数分走る問題がある
// debounceでこれを回避
ipcAgent.setPropsProcessHook(debounce(asyncRerender, 20));
