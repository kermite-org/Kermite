import { css, FC, jsx } from 'alumina';
import { colors } from '~/ui/base';
import { assignerModel } from '~/ui/featureEditors/profileEditor/models/assignerModel';
import { TestInputArea } from '~/ui/featureEditors/profileEditor/ui_bar_testInputArea/TestInputArea';
import { AssignEditSection } from '~/ui/featureEditors/profileEditor/ui_editor_assignsSection';
import { KeyboardSection } from '~/ui/featureEditors/profileEditor/ui_editor_keyboardSection/KeyboardSection';
import { LayersPanelContent } from '~/ui/featureEditors/profileEditor/ui_editor_layerManagement';
import { DisplaySettingsPanelContent } from '~/ui/featureEditors/profileEditor/ui_editor_sideConfigPart/panels/DisplaySettingsPanelContent';
import { InputLogicOptionsPanelContent } from '~/ui/featureEditors/profileEditor/ui_editor_sideConfigPart/panels/InputLogicOptionsPanelContent';
import { ProfilePropertiesPanelContent } from '~/ui/featureEditors/profileEditor/ui_editor_sideConfigPart/panels/ProfilePropertiesPanelContent';
import { ActionRoutingPanel } from '~/ui/featureEditors/profileEditor/ui_modal_routingPanel/ActionRoutingPanel';
import { uiState } from '~/ui/store';

export const KeyAssignEditView: FC = () => {
  const { isUserProfileEditorView } = assignerModel;
  return (
    <div class={cssKeyAssignEditView}>
      <div
        class={cssEditTopBarBox}
        if={isUserProfileEditorView && uiState.settings.showTestInputArea}
      >
        <TestInputArea />
      </div>
      <div class={cssEditMainRow}>
        <div class={cssEditMainColumn}>
          <div class="keyboardPartBox">
            <KeyboardSection />
          </div>
          <div class="assignPartBox">
            <AssignEditSection />
          </div>
          {uiState.profileRoutingPanelVisible && <ActionRoutingPanel />}
        </div>
        <div class={cssEditSideBarColumn}>
          {isUserProfileEditorView && (
            <div class="topPartBox">
              <DisplaySettingsPanelContent />
            </div>
          )}
          <div class="layersPartBox">
            <LayersPanelContent />
          </div>
          <div class="restPartBox">
            <ProfilePropertiesPanelContent />
          </div>
          <div class="logicOptionsPartBox">
            <InputLogicOptionsPanelContent />
          </div>
        </div>
      </div>
    </div>
  );
};

const localStyleConstants = {
  editorPartMargin: '4px',
  panelBoxBorderRadius: '2px',
};

const { editorPartMargin: mm, panelBoxBorderRadius } = localStyleConstants;
const { clPanelBox } = colors;

const cssKeyAssignEditView = css`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  color: ${colors.clMainText};

  > div {
    margin-left: ${mm};
    margin-right: ${mm};
  }
  > div:first-of-type {
    margin-top: ${mm};
  }
  > div + div {
    margin-top: ${mm};
  }
  > div:last-of-type {
    margin-bottom: ${mm};
  }
`;

const cssEditTopBarBox = css`
  background: ${clPanelBox};
  border-radius: ${panelBoxBorderRadius};
  height: 40px;
  flex-shrink: 0;
`;

const cssEditMainRow = css`
  flex-grow: 1;
  display: flex;

  > div + div {
    margin-left: ${mm};
  }
`;

const cssEditMainColumn = css`
  position: relative;
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  > .keyboardPartBox {
    background: ${clPanelBox};
    border-radius: ${panelBoxBorderRadius};
    display: flex;
    flex-direction: column;
    min-width: 200px;
    height: 50%;
    flex-shrink: 0;
    overflow: hidden;
  }

  > .assignPartBox {
    margin-top: ${mm};
    background: ${clPanelBox};
    border-radius: ${panelBoxBorderRadius};
    flex-grow: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
`;

const panelPadding = '8px 10px';

const cssEditSideBarColumn = css`
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  > div + div {
    margin-top: ${mm};
  }

  > .topPartBox {
    background: ${clPanelBox};
    border-radius: ${panelBoxBorderRadius};
    padding: ${panelPadding};
  }

  > .layersPartBox {
    background: ${clPanelBox};
    border-radius: ${panelBoxBorderRadius};
    padding: ${panelPadding};
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  > .logicOptionsPartBox {
    background: ${clPanelBox};
    border-radius: ${panelBoxBorderRadius};
    padding: ${panelPadding};
  }

  > .restPartBox {
    background: ${clPanelBox};
    border-radius: ${panelBoxBorderRadius};
    padding: ${panelPadding};
  }
`;
