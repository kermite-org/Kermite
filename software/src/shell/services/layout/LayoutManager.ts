import {
  ILayoutManagerCommand,
  IProjectLayoutsInfo,
  ILayoutManagerStatus,
  createFallbackPersistKeyboardDesign,
} from '~/shared';
import { ILayoutManager } from '~/shell/services/layout/interfaces';

export class LayoutManager implements ILayoutManager {
  private status: ILayoutManagerStatus = {
    editSource: {
      type: 'NewlyCreated',
    },
    loadedDesign: createFallbackPersistKeyboardDesign(),
    errorMessage: '',
  };

  async executeCommands(commands: ILayoutManagerCommand[]): Promise<void> {
    console.log(`execute layout manager commands`, JSON.stringify(commands));
  }

  async getAllProjectLayoutsInfos(): Promise<IProjectLayoutsInfo[]> {
    return [];
  }

  statusEvents = {
    subscribe: (listener: (status: Partial<ILayoutManagerStatus>) => void) => {
      listener(this.status);
      // todo: status(の一部)が変化したときにそれを送出
      return () => {};
    },
  };
}
