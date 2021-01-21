import {
  ILayoutManagerCommand,
  ILayoutManagerStatus,
  IProjectLayoutsInfo,
} from '~/shared';

export interface ILayoutManager {
  executeCommands(commands: ILayoutManagerCommand[]): Promise<void>;
  getAllProjectLayoutsInfos(): Promise<IProjectLayoutsInfo[]>;
  statusEvents: {
    subscribe: (
      listener: (status: Partial<ILayoutManagerStatus>) => void,
    ) => () => void;
  };
}
