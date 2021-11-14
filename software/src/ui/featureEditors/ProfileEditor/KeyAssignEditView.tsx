import { css, FC, jsx } from 'alumina';
import { colors } from '~/ui/base';
import { assignerModel } from '~/ui/featureEditors/ProfileEditor/models/AssignerModel';
import { TestInputArea } from '~/ui/featureEditors/ProfileEditor/ui_bar_testInputArea/TestInputArea';
import { AssignEditSection } from '~/ui/featureEditors/ProfileEditor/ui_editor_assignsSection';
import { KeyboardSection } from '~/ui/featureEditors/ProfileEditor/ui_editor_keyboardSection/KeyboardSection';
import { LayersSection } from '~/ui/featureEditors/ProfileEditor/ui_editor_layerManagement';
import { BehaviorOptionsPartA } from '~/ui/featureEditors/ProfileEditor/ui_editor_sideConfigPart/BehaviorOptionsPartA';
import { BehaviorOptionsPartB } from '~/ui/featureEditors/ProfileEditor/ui_editor_sideConfigPart/BehaviorOptionsPartB';
import { ProfileConfigurationPart } from '~/ui/featureEditors/ProfileEditor/ui_editor_sideConfigPart/ProfileConfigurationPart';
import { ActionRoutingPanel } from '~/ui/featureEditors/ProfileEditor/ui_modal_routingPanel/ActionRoutingPanel';
import { uiState } from '~/ui/store';

export const KeyAssignEditView: FC = () => {
  const { isUserProfileEditorView } = assignerModel;
  return (
    <div css={cssKeyAssignEditView}>
      <div
        css={cssEditTopBarBox}
        if={isUserProfileEditorView && uiState.settings.showTestInputArea}
      >
        <TestInputArea />
      </div>
      <div css={cssEditMainRow}>
        <div css={cssEditMainColumn}>
          <div class="keyboardPartBox">
            <KeyboardSection />
          </div>
          <div class="assignPartBox">
            <AssignEditSection />
          </div>
          {uiState.profileRoutingPanelVisible && <ActionRoutingPanel />}
        </div>
        <div css={cssEditSideBarColumn}>
          {isUserProfileEditorView && (
            <div class="topPartBox">
              <BehaviorOptionsPartA />
            </div>
          )}
          <div class="layersPartBox">
            <LayersSection />
          </div>
          <div class="restPartBox">
            <ProfileConfigurationPart />
            <BehaviorOptionsPartB />
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

const cssEditSideBarColumn = css`
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  > div + div {
    margin-top: ${mm};
  }

  > .topPartBox {
    background: ${clPanelBox};
    border-radius: ${panelBoxBorderRadius};
  }

  > .layersPartBox {
    background: ${clPanelBox};
    border-radius: ${panelBoxBorderRadius};
    height: 300px;
    flex-shrink: 0;
  }

  > .restPartBox {
    background: ${clPanelBox};
    border-radius: ${panelBoxBorderRadius};
    flex-grow: 1;
  }
`;
