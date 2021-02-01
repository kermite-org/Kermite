import { useLocal } from '~/ui-common';
import { ILayoutManagerViewModel } from '~/ui-layouter-page/LayoutManagerViewModel';

type ILayoutManagerViewModelCommandFunctionKey =
  | 'createNewLayout'
  // | 'loadCurrentProfileLayout'
  | 'loadFromFileWithDialog'
  | 'saveToFileWithDialog'
  | 'openLoadFromProjectModal'
  | 'openSaveToProjectModal'
  | 'overwriteLayout'
  | 'showEditLayoutFileInFiler';

type ILayoutManagerViewModelCommandActiveFlagKey = 'canShowEditLayoutFileInFiler';

interface IMenuItemSource {
  text: string;
  command: ILayoutManagerViewModelCommandFunctionKey;
  commandActiveFlagKey?: ILayoutManagerViewModelCommandActiveFlagKey;
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
  { separator: true },
  {
    text: 'show edit file in folder',
    command: 'showEditLayoutFileInFiler',
    commandActiveFlagKey: 'canShowEditLayoutFileInFiler',
  },
];

type IMenuItem =
  | { type: 'menuEntry'; text: string; handler: () => void; disabled?: boolean }
  | { type: 'separator' };

export const useLayoutManagerMenuModel = (baseVm: ILayoutManagerViewModel) => {
  const state = useLocal({ isOpen: false });
  const openMenu = () => (state.isOpen = true);
  const closeMenu = () => (state.isOpen = false);

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
          disabled:
            source.commandActiveFlagKey && !baseVm[source.commandActiveFlagKey],
        },
  );
  return {
    isOpen: state.isOpen,
    openMenu,
    closeMenu,
    menuItems,
  };
};
