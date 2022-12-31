import { IPersistKeyboardLayout, IPersistProfileData } from '~/app-shared';

type IDiProfileEditor = {
  loadProfile(itemPath: string): IPersistProfileData;
  loadLayout(itemPath: string): IPersistKeyboardLayout;
  saveProfile(itemPath: string, profile: IPersistProfileData): void;
};

export const diProfileEditor = {} as IDiProfileEditor;
