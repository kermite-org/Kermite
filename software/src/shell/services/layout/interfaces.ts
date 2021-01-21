import {
  ILayoutManagerCommand,
  ILayoutManagerStatus,
  IProjectLayoutsInfo,
} from '~/shared';
import { IListenerPortS } from '~/shell/base';

export interface ILayoutManager {
  executeCommands(commands: ILayoutManagerCommand[]): Promise<boolean>;
  getAllProjectLayoutsInfos(): Promise<IProjectLayoutsInfo[]>;
  statusEvents: IListenerPortS<Partial<ILayoutManagerStatus>>;
}
