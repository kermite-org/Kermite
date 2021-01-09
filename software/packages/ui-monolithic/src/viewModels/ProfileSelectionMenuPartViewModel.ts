import { Hook } from 'qx';
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
  | 'deleteProfile';

const profileMenuCommands: IProfileMenuCommand[] = [
  'createProfile',
  'renameProfile',
  'copyProfile',
  'deleteProfile',
];

const profileMenuCommandTexts: { [key in IProfileMenuCommand]: string } = {
  createProfile: 'new',
  renameProfile: 'rename',
  copyProfile: 'copy',
  deleteProfile: 'delete',
};

export function makeProfileSelectionMenuPartViewModel(
  vm: IProfileManagementPartViewModel,
) {
  const state = Hook.useMemo(() => ({ isOpen: false }), []);
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
      return profileMenuCommands.map((cmd, index) => ({
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
