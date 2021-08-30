import { IGeneralMenuItem } from '~/ui/base';

export type ProjectManagementMenuModel = {
  menuItems: IGeneralMenuItem[];
};

const menuItems: IGeneralMenuItem[] = [
  {
    type: 'menuEntry',
    text: 'create new',
    handler: () => {},
    disabled: true,
  },
  {
    type: 'menuEntry',
    text: 'copy from online project',
    handler: () => {},
  },
  {
    type: 'menuEntry',
    text: 'rename',
    handler: () => {},
    disabled: true,
  },
  {
    type: 'menuEntry',
    text: 'delete',
    handler: () => {},
    disabled: true,
  },
  {
    type: 'menuEntry',
    text: 'open data folder',
    handler: () => {},
    disabled: true,
  },
];
export function useProjectManagementMenuModel(): ProjectManagementMenuModel {
  return {
    menuItems,
  };
}
