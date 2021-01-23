import {
  ILayoutManagerCommand,
  ILayoutManagerStatus,
  IPersistKeyboardDesign,
} from '~/shared';
import { IListenerPortS } from '~/shell/base';

export interface ILayoutManager {
  // getAllProjectLayoutsInfos(): Promise<IProjectLayoutsInfo[]>;
  executeCommands(commands: ILayoutManagerCommand[]): Promise<boolean>;
  statusEvents: IListenerPortS<Partial<ILayoutManagerStatus>>;
}

export interface ILayoutFileLoader {
  loadLayoutFromFile(filePath: string): Promise<IPersistKeyboardDesign>;
  saveLayoutToFile(
    filePath: string,
    design: IPersistKeyboardDesign,
  ): Promise<void>;
}
