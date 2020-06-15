import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import { UiTheme } from '~ui2/views/common/UiTheme';
import { AssignEditSection } from './AssignEditSection';
import { KeyboardSection } from './KeyboardSection';
import { LayersSection } from './LayersSection';
import { TestInputArea } from './TestInputArea';
import { ProfileConfigurationPart } from './ProfileConfigurationPart';
import { appDomain } from '~ui2/models/zAppDomain';

export const KeyAssignEditPage = () => {
  const { clPanelBox, editorPartMargin: mm } = UiTheme;

  const cssKeyAssignEditPageRoot = css`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    color: #fff;

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
    display: flex;
    flex-direction: column;
    min-width: 200px;
    min-height: 80px;
    flex-shrink: 0;
  `;

  const cssAssignPartBox = css`
    background: ${clPanelBox};
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
    height: 300px;
    flex-shrink: 0;
  `;

  const cssRestPartBox = css`
    background: ${clPanelBox};
    flex-grow: 1;
  `;

  return (
    <div css={cssKeyAssignEditPageRoot}>
      <div
        css={cssEditTopBarBox}
        qxIf={appDomain.uiStatusModel.settings.showTestInputArea}
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
