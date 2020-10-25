import { IProfileManagerViewModel } from './ProfileManagementPart.model';

type IProfileMenuCommand =
  | 'createProfile'
  | 'renameProfile'
  | 'copyProfile'
  | 'deleteProfile';

const profileMenuCommands: IProfileMenuCommand[] = [
  'createProfile',
  'renameProfile',
  'copyProfile',
  'deleteProfile'
];

const profileMenuCommandTexts: { [key in IProfileMenuCommand]: string } = {
  createProfile: 'new',
  renameProfile: 'rename',
  copyProfile: 'copy',
  deleteProfile: 'delete'
};

export function makeProfileSelectionMenuPartModel(
  vm: IProfileManagerViewModel
) {
  const self = {
    isOpen: false,
    openMenu() {
      self.isOpen = true;
    },
    closeMenu() {
      self.isOpen = false;
    },
    menuItems: profileMenuCommands.map((cmd, index) => ({
      key: `cmd${index}`,
      text: profileMenuCommandTexts[cmd],
      handler() {
        vm[cmd]();
        self.isOpen = false;
      }
    }))
  };
  return self;
}
