import { css } from 'goober';
import { h } from '~lib/qx';
import { AssignEditSection } from './AssignEditSection';
import { KeyboardSection } from './KeyboardSection';
import { LayersSection } from './LayersSection';
import { TestInputArea } from './TestInputArea';
import { ProfileConfigurationPart } from './ProfileConfigurationPart';
import { uiStatusModel } from '~ui/models';
import { uiTheme } from '~ui/models/UiTheme';

const localStyleConstants = {
  editorPartMargin: '4px',
  panelBoxBorderRadius: '3px'
};

export const KeyAssignEditPage = () => {
  const { editorPartMargin: mm, panelBoxBorderRadius } = localStyleConstants;
  const { clPanelBox } = uiTheme.colors;

  const cssKeyAssignEditPageRoot = css`
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
    min-height: 80px;
    flex-shrink: 0;
  `;

  const cssAssignPartBox = css`
    background: ${clPanelBox};
    border-radius: ${panelBoxBorderRadius};
    flex-grow: 1;
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

  return (
    <div css={cssKeyAssignEditPageRoot}>
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
          </div>
        </div>
      </div>
    </div>
  );
};
