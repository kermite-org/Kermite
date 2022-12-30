import { IPersistKeyboardLayout, replaceArrayItem } from '~/app-shared';
import { diLayoutEditor } from '~/feature-layout-editor';
import { appStore } from './appStore';

export function setupRetainerEditItemLoader() {
  diLayoutEditor.loadLayout = (itemPath: string) => {
    const { currentProject } = appStore.state;
    const itemName = itemPath.split('/')[2];
    const layout = currentProject.layouts.find((la) => la.name === itemName);
    return layout?.data;
  };
  diLayoutEditor.saveLayout = (
    itemPath: string,
    layout: IPersistKeyboardLayout,
  ) => {
    const { currentProject } = appStore.state;
    const itemName = itemPath.split('/')[2];
    replaceArrayItem(currentProject.layouts, (la) => la.name === itemName, {
      name: itemName,
      data: layout,
    });
  };
}
