import { IPersistKeyboardDesign } from '~/shared';
import { ILayoutFileLoader } from '~/shell/services/layout/interfaces';

class LayoutFileLoader implements ILayoutFileLoader {
  async loadLayoutFromFile(filePath: string): Promise<IPersistKeyboardDesign> {}

  async saveLayoutToFile(
    filePath: string,
    design: IPersistKeyboardDesign,
  ): Promise<void> {}
}

export const layoutFileLoader = new LayoutFileLoader();
