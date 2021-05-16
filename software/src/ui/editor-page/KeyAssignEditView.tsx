import { jsx, css } from 'qx';
import { uiTheme, uiStatusModel } from '~/ui/common';
import { BehaviorOptionsPartA } from '~/ui/editor-page/editorMainPart/views/BehaviorOptionsPartA';
import { ProfileConfigurationPart } from '~/ui/editor-page/editorMainPart/views/ProfileConfigurationPart';
import { editorPageModel } from '~/ui/editor-page/editorPageModel';
import { ActionRoutingPanel } from '~/ui/editor-page/routingPanel/ActionRoutingPanel';
import { KeyboardSection } from './editorMainPart/KeyboardSection';
import { BehaviorOptionsPartB } from './editorMainPart/views/BehaviorOptionsPartB';
import { AssignEditSection } from './editorMainPart/views/assignEditSection';
import { LayersSection } from './editorMainPart/views/layersSection';
import { TestInputArea } from './testInputArea/TestInputArea';

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

export const KeyAssignEditView = () => {
  return (
    <div css={cssKeyAssignEditView}>
      <div
        css={cssEditTopBarBox}
        qxIf={uiStatusModel.settings.showTestInputArea}
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
