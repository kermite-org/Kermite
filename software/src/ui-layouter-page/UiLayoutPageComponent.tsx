import { css } from 'goober';
import { h } from 'qx';
import { UiLayouterCore } from '~/ui-layouter';
import { LayoutManagementBar } from '~/ui-layouter-page/LayoutManagementBar';

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
        <LayoutManagementBar />
      </div>
      <div className="mainRow">
        <UiLayouterCore.Component />
      </div>
    </div>
  );
};
