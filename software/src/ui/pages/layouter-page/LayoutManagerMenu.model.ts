import { IGeneralMenuItem } from '~/ui/base';
import { ILayoutManagerViewModel } from '~/ui/pages/layouter-page/LayoutManagerViewModel';

type ILayoutManagerViewModelCommandFunctionKey =
  | 'createNewLayout'
  | 'loadCurrentProfileLayout'
  | 'loadFromFileWithDialog'
  | 'saveToFileWithDialog'
  | 'openLoadFromProjectModal'
  | 'openSaveToProjectModal'
  | 'overwriteLayout'
  | 'showEditLayoutFileInFiler'
  | 'createNewProfileFromCurrentLayout';

type ILayoutManagerViewModelCommandActiveFlagKey =
  | 'canShowEditLayoutFileInFiler'
  | 'canOpenProjectIoModal'
  | 'canCreateNewLayout'
  | 'canCreateProfile'
  | 'canSaveToFile';

interface IMenuItemSource {
  text: string;
  command: ILayoutManagerViewModelCommandFunctionKey;
  commandActiveFlagKey?: ILayoutManagerViewModelCommandActiveFlagKey;
}

type IMenuItemSeparator = { separator: true };

const menuItemSources: (IMenuItemSource | IMenuItemSeparator)[] = [
  {
    text: 'new design',
    command: 'createNewLayout',
    commandActiveFlagKey: 'canCreateNewLayout',
  },
  // { text: 'edit current profile layout', command: 'loadCurrentProfileLayout' },
  { separator: true },
  { text: 'load from file...', command: 'loadFromFileWithDialog' },
  {
    text: 'save to file...',
    command: 'saveToFileWithDialog',
    commandActiveFlagKey: 'canSaveToFile',
  },
  { separator: true },
  {
    text: 'load from project...',
    command: 'openLoadFromProjectModal',
    commandActiveFlagKey: 'canOpenProjectIoModal',
  },
  {
    text: 'save to project...',
    command: 'openSaveToProjectModal',
    commandActiveFlagKey: 'canOpenProjectIoModal',
  },
  { separator: true },
  {
    text: 'create profile',
    command: 'createNewProfileFromCurrentLayout',
    commandActiveFlagKey: 'canCreateProfile',
  },
  {
    text: 'show edit file in folder',
    command: 'showEditLayoutFileInFiler',
    commandActiveFlagKey: 'canShowEditLayoutFileInFiler',
  },
];

export const useLayoutManagerMenuModel = (baseVm: ILayoutManagerViewModel) => {
  const menuItems: IGeneralMenuItem[] = menuItemSources.map((source) =>
    'separator' in source
      ? { type: 'separator' }
      : {
          type: 'menuEntry',
          text: source.text,
          handler: () => baseVm[source.command](),
          disabled:
            source.commandActiveFlagKey && !baseVm[source.commandActiveFlagKey],
        },
  );
  return {
    menuItems,
  };
};
