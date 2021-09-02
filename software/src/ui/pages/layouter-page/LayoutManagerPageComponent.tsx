import { jsx, css, FC } from 'qx';
import { uiTheme } from '~/ui/base';
import { UiLayouterCore } from '~/ui/features';
import { LayoutManagerTopBar } from '~/ui/pages/layouter-page/LayoutManagerTopBar';

export const LayoutManagerPageComponent: FC = () => {
  return (
    <div css={style}>
      <div className="topRow">
        <LayoutManagerTopBar />
      </div>
      <div className="mainRow">
        <UiLayouterCore.Component />
      </div>
    </div>
  );
};

const style = css`
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
