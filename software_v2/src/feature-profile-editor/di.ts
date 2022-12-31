import { IPersistProfileData } from '~/app-shared';

type IDiProfileEditor = {
  loadProfile(itemPath: string): IPersistProfileData | undefined;
  saveProfile(itemPath: string, profile: IPersistProfileData): void;
};

export const diProfileEditor = {} as IDiProfileEditor;
