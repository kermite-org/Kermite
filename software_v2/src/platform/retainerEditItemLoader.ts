import { diLayoutEditor } from '~/feature-layout-editor';
import { diProfileEditor } from '~/feature-profile-editor';
import { appStore } from './appStore';

export function setupRetainerEditItemLoader() {
  function getProjectResourceItem(itemPath: string) {
    const [projectId, itemType, itemName] = itemPath.split('/');
    const { currentProject } = appStore.state;
    if (projectId === currentProject.projectId) {
      const itemsPropName = {
        profile: 'profiles' as const,
        layout: 'layouts' as const,
        firmware: 'firmwares' as const,
      }[itemType];
      if (itemsPropName) {
        const items = currentProject[itemsPropName] as {
          name: string;
          data: any;
        }[];
        const item = items.find((it) => it.name === itemName);
        return item;
      }
    }
    return undefined;
  }

  const loadProjectResourceItem = (itemPath: string) => {
    const item = getProjectResourceItem(itemPath);
    return item?.data;
  };
  const saveProjectResourceItem = (itemPath: string, data: any) => {
    const item = getProjectResourceItem(itemPath);
    if (item) {
      item.data = data;
    }
  };
  diProfileEditor.loadProfile = loadProjectResourceItem;
  diProfileEditor.loadLayout = loadProjectResourceItem;
  diProfileEditor.saveProfile = saveProjectResourceItem;
  diLayoutEditor.loadLayout = loadProjectResourceItem;
  diLayoutEditor.saveLayout = saveProjectResourceItem;
}
