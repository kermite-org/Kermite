import { jsx, css } from 'qx';
import { uiTheme } from '~/ui/common/base';
import { UiLayouterCore } from '~/ui/pages/layouter';
import { LayoutManagerTopBar } from '~/ui/pages/layouter-page/LayoutManagerTopBar';

const cssBase = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${uiTheme.colors.clBackground};
  /* background: ${uiTheme.colors.clPanelBox}; */
  /* padding: 4px; */

  > .topRow {
    /* background: ${uiTheme.colors.clPanelBox}; */
    /* background: ${uiTheme.colors.clBackground}; */
    flex-shrink: 0;
  }

  > .mainRow {
    flex-grow: 1;
    /* margin-top: 4px; */
    /* margin: 4px; */
  }
`;
export const UiLayouterPageComponent = () => {
  return (
    <div css={cssBase}>
      <div className="topRow">
        <LayoutManagerTopBar />
      </div>
      <div className="mainRow">
        <UiLayouterCore.Component />
      </div>
    </div>
  );
};
