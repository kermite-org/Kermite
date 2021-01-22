import {
  ILayoutManagerCommand,
  IProjectLayoutsInfo,
  ILayoutManagerStatus,
  createFallbackPersistKeyboardDesign,
} from '~/shared';
import { createEventPort2 } from '~/shell/funcs';
import { ILayoutManager } from '~/shell/services/layout/interfaces';
import { IProjectResourceInfoProvider } from '~/shell/services/serviceInterfaces';

export class LayoutManager implements ILayoutManager {
  constructor(
    private projectResourceInfoProvider: IProjectResourceInfoProvider,
  ) {}

  private status: ILayoutManagerStatus = {
    editSource: {
      type: 'NewlyCreated',
    },
    loadedDesign: createFallbackPersistKeyboardDesign(),
    errorMessage: '',
  };

  statusEvents = createEventPort2<Partial<ILayoutManagerStatus>>({
    initialValueGetter: () => this.status,
    onFirstSubscriptionStarting: () => {},
    onLastSubscriptionEnded: () => {},
  });

  private setStatus(newStatusPartial: Partial<ILayoutManagerStatus>) {
    this.status = { ...this.status, ...newStatusPartial };
    this.statusEvents.emit(newStatusPartial);
  }

  private async executeCommand(command: ILayoutManagerCommand) {
    console.log(`execute layout manager command`, JSON.stringify(command));

    if (command.type === 'createNewLayout') {
      this.setStatus({
        editSource: { type: 'NewlyCreated' },
      });
    } else if (command.type === 'loadCurrentProfileLayout') {
      this.setStatus({
        editSource: { type: 'CurrentProfile' },
      });
    } else if (command.type === 'save') {
    } else if (command.type === 'loadFromFile') {
      const { filePath } = command;
      this.setStatus({
        editSource: { type: 'File', filePath },
      });
    } else if (command.type === 'saveToFile') {
      const { filePath } = command;
      this.setStatus({
        editSource: { type: 'File', filePath },
      });
    } else if (command.type === 'loadFromProject') {
      const { projectId, layoutName } = command;
      this.setStatus({
        editSource: {
          type: 'ProjectLayout',
          projectId,
          layoutName,
        },
      });
    } else if (command.type === 'saveToProject') {
      const { projectId, layoutName } = command;
      this.setStatus({
        editSource: {
          type: 'ProjectLayout',
          projectId,
          layoutName,
        },
      });
    }
  }

  async executeCommands(commands: ILayoutManagerCommand[]): Promise<boolean> {
    try {
      commands.forEach((command) => this.executeCommand(command));
    } catch (error) {
      this.status.errorMessage = `error@LayoutManager ${error}`;
      return false;
    }
    return true;
  }

  async getAllProjectLayoutsInfos(): Promise<IProjectLayoutsInfo[]> {
    return [
      {
        projectId: 'proj1',
        projectPath: 'proto/proj1',
        keyboardName: 'Proto-One',
        layoutNames: ['default', 'layout1'],
      },
      {
        projectId: 'proj2',
        projectPath: 'proto/proj2',
        keyboardName: 'proto2',
        layoutNames: ['default', 'layout1', 'layout2'],
      },
    ];
  }
}
