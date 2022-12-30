import { IPersistKeyboardLayout } from '~/app-shared';

type IDiLayoutEditor = {
  loadLayout(itemPath: string): IPersistKeyboardLayout | undefined;
  saveLayout(itemPath: string, layout: IPersistKeyboardLayout): void;
};

export const diLayoutEditor = {} as IDiLayoutEditor;
