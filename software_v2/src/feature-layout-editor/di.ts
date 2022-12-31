import { IPersistKeyboardLayout } from '~/app-shared';

type IDiLayoutEditor = {
  loadLayout(itemPath: string): IPersistKeyboardLayout;
  saveLayout(itemPath: string, layout: IPersistKeyboardLayout): void;
};

export const diLayoutEditor = {} as IDiLayoutEditor;
