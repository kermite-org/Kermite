import { ILayoutManagerCommand } from '~/shared';

export interface ILayoutManager {
  // getAllProjectLayoutsInfos(): Promise<IProjectLayoutsInfo[]>;
  executeCommands(commands: ILayoutManagerCommand[]): Promise<boolean>;
  showEditLayoutFileInFiler(): void;
}
