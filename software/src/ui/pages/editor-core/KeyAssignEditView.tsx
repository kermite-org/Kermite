import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { uiState } from '~/ui/commonStore';
import { TestInputArea } from '~/ui/pages/editor-core/ui_bar_testInputArea/TestInputArea';
import { AssignEditSection } from '~/ui/pages/editor-core/ui_editor_assignsSection';
import { KeyboardSection } from '~/ui/pages/editor-core/ui_editor_keyboardSection/KeyboardSection';
import { LayersSection } from '~/ui/pages/editor-core/ui_editor_layerManagement';
import { BehaviorOptionsPartA } from '~/ui/pages/editor-core/ui_editor_sideConfigPart/BehaviorOptionsPartA';
import { BehaviorOptionsPartB } from '~/ui/pages/editor-core/ui_editor_sideConfigPart/BehaviorOptionsPartB';
import { ProfileConfigurationPart } from '~/ui/pages/editor-core/ui_editor_sideConfigPart/ProfileConfigurationPart';
import { ActionRoutingPanel } from '~/ui/pages/editor-core/ui_modal_routingPanel/ActionRoutingPanel';
import { editorPageModel } from '~/ui/pages/editor-page/models/editorPageModel';

type Props = {
  forceHideTestInputArea?: boolean;
};
export const KeyAssignEditView: FC<Props> = ({ forceHideTestInputArea }) => {
  return (
    <div css={cssKeyAssignEditView}>
      <div
        css={cssEditTopBarBox}
        qxIf={!forceHideTestInputArea && uiState.settings.showTestInputArea}
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
          {editorPageModel.routingPanelVisible && <ActionRoutingPanel />}
        </div>
        <div css={cssEditSideBarColumn}>
          <div class="topPartBox">
            <BehaviorOptionsPartA />
          </div>
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
const { clPanelBox } = uiTheme.colors;

const cssKeyAssignEditView = css`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  color: ${uiTheme.colors.clMainText};

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
