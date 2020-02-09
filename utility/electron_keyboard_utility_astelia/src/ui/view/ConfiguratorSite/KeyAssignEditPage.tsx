import { UiTheme } from './UiTheme';
import css from '@emotion/css';
import { AssignSection } from './sections/AssignPaletteSection/AssignSection';
import { KeyboardSection } from './sections/KeyboardSection/KeyboardSection';
import { LayersSection } from './sections/LayersSection/LayersSection';
import { ProfileSelection } from './sections/ProfileSection';
import { jsx } from '@emotion/core';

export const KeyAssignEditPage = () => {
  const { clPanelBox, editorPartMargin: mm } = UiTheme;

  const cssKeyAssignEditPageRoot = css`
    flex-grow: 1;
    display: flex;
    flex-direction: column;

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
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-width: 100px;
    min-height: 50px;
  `;

  const cssAssignPartBox = css`
    background: ${clPanelBox};
    height: 230px;
    flex-shrink: 0;
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
      <div css={cssEditTopBarBox}>
        <ProfileSelection />
      </div>
      <div css={cssEditMainRow}>
        <div css={cssEditMainColumn}>
          <div css={cssKeyboardPartBox}>
            <KeyboardSection />
          </div>
          <div css={cssAssignPartBox}>
            <AssignSection />
          </div>
        </div>
        <div css={cssEditSideBarColumn}>
          <div css={cssLayersPartBox}>
            <LayersSection />
          </div>
          <div css={cssRestPartBox} />
        </div>
      </div>
    </div>
  );
};
