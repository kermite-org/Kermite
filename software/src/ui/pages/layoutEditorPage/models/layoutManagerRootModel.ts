import { useEffect } from 'alumina';
import { LayoutEditorCore, assignerModel } from '~/ui/featureEditors';
import { layoutManagerState } from '~/ui/pages/layoutEditorPage/models/layoutManagerBase';
import { uiState } from '~/ui/store';

export const layoutManagerRootModel = {
  updateBeforeRender() {
    const { layoutEditSource, loadedLayoutData } = uiState.core;

    useEffect(() => {
      layoutManagerState.modalState = 'None';
    }, []);

    useEffect(() => {
      if (layoutEditSource !== layoutManagerState.layoutEditSource) {
        LayoutEditorCore.loadEditDesign(loadedLayoutData);
        layoutManagerState.layoutEditSource = layoutEditSource;
      }
    }, [layoutEditSource]);

    useEffect(() => {
      return () => {
        const layoutEditSourceOnClosingView = uiState.core.layoutEditSource;
        if (layoutEditSourceOnClosingView.type === 'CurrentProfile') {
          const design = LayoutEditorCore.emitSavingDesign();
          assignerModel.replaceKeyboardDesign(design);
        }
      };
    }, []);
  },
};
