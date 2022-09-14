import { IPersistKeyboardDesign } from '~/shared';

interface IDiKicadImporter {
  applyImportLayout(design: IPersistKeyboardDesign): void;
}

export const diKicadImporter: IDiKicadImporter = {
  applyImportLayout: undefined!,
};
