import { useEffect } from 'qx';
import { LayoutEditorCore } from '~/ui/features';
import { editorModel } from '~/ui/features/ProfileEditor/models/EditorModel';
import { layoutManagerState } from '~/ui/pages/layout-editor-page/models/LayoutManagerBase';
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
          editorModel.replaceKeyboardDesign(design);
        }
      };
    }, []);
  },
};
