import { Hook } from 'qx';
import { ILayoutManagerViewModel } from '~/ui-layouter-page/LayoutManagerViewModel';

type ILayoutManagerViewModelCommandFunctionKey =
  | 'createNewLayout'
  // | 'loadCurrentProfileLayout'
  | 'loadFromFileWithDialog'
  | 'saveToFileWithDialog'
  | 'openLoadFromProjectModal'
  | 'openSaveToProjectModal'
  | 'overwriteLayout';

interface IMenuItemSource {
  text: string;
  command: ILayoutManagerViewModelCommandFunctionKey;
}

type IMenuItemSeparator = { separator: true };

const menuItemSources: (IMenuItemSource | IMenuItemSeparator)[] = [
  { text: 'new design', command: 'createNewLayout' },
  { separator: true },
  { text: 'load from file', command: 'loadFromFileWithDialog' },
  { text: 'save to file', command: 'saveToFileWithDialog' },
  { separator: true },
  { text: 'load from project', command: 'openLoadFromProjectModal' },
  { text: 'save to project', command: 'openSaveToProjectModal' },
];

type IMenuItem =
  | { type: 'menuEntry'; text: string; handler: () => void }
  | { type: 'separator' };

export const useLayoutManagerMenuModel = (baseVm: ILayoutManagerViewModel) => {
  const [isOpen, setIsOpen] = Hook.useState(false);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);

  const menuItems: IMenuItem[] = menuItemSources.map((source) =>
    'separator' in source
      ? { type: 'separator' }
      : {
          type: 'menuEntry',
          text: source.text,
          handler: () => {
            baseVm[source.command]();
            closeMenu();
          },
        },
  );
  return {
    isOpen,
    openMenu,
    closeMenu,
    menuItems,
  };
};
