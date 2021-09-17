import { useEffect } from 'qx';
import { uiState } from '~/ui/commonStore';
import { UiLayouterCore } from '~/ui/features';
import { editorModel } from '~/ui/features/ProfileEditor/models/EditorModel';
import { layoutManagerState } from '~/ui/pages/layouter-page/models/LayoutManagerBase';

export const layoutManagerRootModel = {
  updateBeforeRender() {
    const { layoutEditSource, loadedLayoutData } = uiState.core;

    useEffect(() => {
      layoutManagerState.modalState = 'None';
    }, []);

    useEffect(() => {
      if (layoutEditSource !== layoutManagerState.layoutEditSource) {
        UiLayouterCore.loadEditDesign(loadedLayoutData);
        layoutManagerState.layoutEditSource = layoutEditSource;
      }
    }, [layoutEditSource]);

    useEffect(() => {
      return () => {
        const layoutEditSourceOnClosingView = uiState.core.layoutEditSource;
        if (layoutEditSourceOnClosingView.type === 'CurrentProfile') {
          const design = UiLayouterCore.emitSavingDesign();
          editorModel.replaceKeyboardDesign(design);
        }
      };
    }, []);
  },
};
