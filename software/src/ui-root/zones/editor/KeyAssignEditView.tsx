import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';
import { ProfileConfigurationPart } from '~/ui-root/zones/editor/EditorMainPart/views/ProfileConfigurationPart';
import { KeyboardSection } from './EditorMainPart/KeyboardSection';
import { AssignEditSection } from './EditorMainPart/views/AssignEditSection';
import { BehaviorOptionsPart } from './EditorMainPart/views/BehaviorOptionsPart';
import { LayersSection } from './EditorMainPart/views/LayersSection';
import { TestInputArea } from './TestInputArea/TestInputArea';

const localStyleConstants = {
  editorPartMargin: '4px',
  panelBoxBorderRadius: '3px',
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
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  > div + div {
    margin-top: ${mm};
  }
`;

const cssKeyboardPartBox = css`
  background: ${clPanelBox};
  border-radius: ${panelBoxBorderRadius};
  display: flex;
  flex-direction: column;
  min-width: 200px;
  height: 50%;
  flex-shrink: 0;
  overflow: hidden;
`;

const cssAssignPartBox = css`
  background: ${clPanelBox};
  border-radius: ${panelBoxBorderRadius};
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const cssEditSideBarColumn = css`
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  > div + div {
    margin-top: ${mm};
  }
`;

const cssLayersPartBox = css`
  background: ${clPanelBox};
  border-radius: ${panelBoxBorderRadius};
  height: 300px;
  flex-shrink: 0;
`;

const cssRestPartBox = css`
  background: ${clPanelBox};
  border-radius: ${panelBoxBorderRadius};
  flex-grow: 1;
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
          <div css={cssKeyboardPartBox}>
            <KeyboardSection />
          </div>
          <div css={cssAssignPartBox}>
            <AssignEditSection />
          </div>
        </div>
        <div css={cssEditSideBarColumn}>
          <div css={cssLayersPartBox}>
            <LayersSection />
          </div>
          <div css={cssRestPartBox}>
            <ProfileConfigurationPart />
            <BehaviorOptionsPart />
          </div>
        </div>
      </div>
    </div>
  );
};
