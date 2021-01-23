import { css } from 'goober';
import { h } from 'qx';
import { UiLayouterCore } from '~/ui-layouter';
import { LayoutManagerTopBar } from '~/ui-layouter-page/LayoutManagerTopBar';

const cssBase = css`
  height: 100%;
  display: flex;
  flex-direction: column;

  > .topRow {
    flex-shrink: 0;
  }

  > .mainRow {
    flex-grow: 1;
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
