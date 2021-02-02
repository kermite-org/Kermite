import { useLocal } from '~/ui-common';
import { useProjectResourcePresenceChecker } from '~/ui-common/sharedModels/hooks';
import { IProfileManagementPartViewModel } from './ProfileManagementPartViewModel';

export interface IProfileSelectionMenuPartViewModel {
  isOpen: boolean;
  openMenu(): void;
  closeMenu(): void;
  menuItems: {
    key: string;
    text: string;
    handler(): void;
  }[];
}

type IProfileMenuCommand =
  | 'createProfile'
  | 'renameProfile'
  | 'copyProfile'
  | 'deleteProfile'
  | 'openExportingPresetSelectionModal';

const profileMenuCommands: IProfileMenuCommand[] = [
  'createProfile',
  'renameProfile',
  'copyProfile',
  'deleteProfile',
];

const profileMenuCommandsWithProjectIO: IProfileMenuCommand[] = [
  'createProfile',
  'renameProfile',
  'copyProfile',
  'deleteProfile',
  'openExportingPresetSelectionModal',
];

const profileMenuCommandTexts: { [key in IProfileMenuCommand]: string } = {
  createProfile: 'new',
  renameProfile: 'rename',
  copyProfile: 'copy',
  deleteProfile: 'delete',
  openExportingPresetSelectionModal: 'save as preset',
};

export function makeProfileSelectionMenuPartViewModel(
  vm: IProfileManagementPartViewModel,
) {
  const state = useLocal({ isOpen: false });

  const isLocalProjectsAvailable = useProjectResourcePresenceChecker('local');

  const sourceMenuCoomands = isLocalProjectsAvailable
    ? profileMenuCommandsWithProjectIO
    : profileMenuCommands;

  return {
    get isOpen() {
      return state.isOpen;
    },
    openMenu() {
      state.isOpen = true;
    },
    closeMenu() {
      state.isOpen = false;
    },
    get menuItems() {
      return sourceMenuCoomands.map((cmd, index) => ({
        key: `cmd${index}`,
        text: profileMenuCommandTexts[cmd],
        handler() {
          vm[cmd]();
          state.isOpen = false;
        },
      }));
    },
  };
}
