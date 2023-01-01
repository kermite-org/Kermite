import { FC, css, jsx } from 'alumina';
import { colors } from '~/app-shared';
import { profileEditorStore } from '../store';
import { TestInputArea } from './ui_bar_testInputArea/TestInputArea';
import { AssignEditSection } from './ui_editor_assignsSection';
import { KeyboardSection } from './ui_editor_keyboardSection/KeyboardSection';
import { LayersPanelContent } from './ui_editor_layerManagement';
import {
  DisplaySettingsPanelContent,
  InputLogicOptionsPanelContent,
  ProfileOperationPartContent,
  ProfilePropertiesPanelContent,
} from './ui_editor_sideConfigPart/panels';
import { ActionRoutingPanel } from './ui_modal_routingPanel/ActionRoutingPanel';

export const KeyAssignEditView: FC = () => {
  const { routingPanelVisible, showTestInputArea } = profileEditorStore.readers;
  return (
    <div class={cssKeyAssignEditView}>
      <div class={cssEditMainRow}>
        <div class={cssEditMainColumn}>
          <div class={cssEditTopBarBox} if={showTestInputArea}>
            <TestInputArea />
          </div>

          <div class="keyboardPartBox">
            <KeyboardSection />
          </div>
          <div class="assignPartBox">
            <AssignEditSection />
          </div>
          {routingPanelVisible && <ActionRoutingPanel />}
        </div>
        <div class={cssEditSideBarColumn}>
          <div>
            <ProfileOperationPartContent />
          </div>

          <div class="topPartBox">
            <DisplaySettingsPanelContent />
          </div>

          <div class="layersPartBox">
            <LayersPanelContent />
          </div>
          <div class="restPartBox" if={false}>
            <ProfilePropertiesPanelContent />
          </div>
          <div class="logicOptionsPartBox" if={false}>
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
  width: 200px;
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
