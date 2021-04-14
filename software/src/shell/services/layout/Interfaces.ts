import { ILayoutManagerCommand, ILayoutManagerStatus } from '~/shared';
import { IListenerPortS } from '~/shell/base';

export interface ILayoutManager {
  // getAllProjectLayoutsInfos(): Promise<IProjectLayoutsInfo[]>;
  executeCommands(commands: ILayoutManagerCommand[]): Promise<boolean>;
  statusEvents: IListenerPortS<Partial<ILayoutManagerStatus>>;
  showEditLayoutFileInFiler(): void;
}
