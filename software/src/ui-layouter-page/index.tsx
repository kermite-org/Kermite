import { UiLayouterCore } from '@ui-layouter';
import { css } from 'goober';
import { h } from 'qx';

const cssBase = css`
  height: 100%;
  display: flex;
  flex-direction: column;

  > .topRow {
    flex-shrink: 0;
    display: flex;
    background: #fff;
    padding: 5px;

    > * + * {
      margin-left: 5px;
    }
    > button {
      width: 80px;
      height: 28px;
      cursor: pointer;
    }
  }

  > .mainRow {
    flex-grow: 1;
  }
`;
export const UiLayouterPageComponent = () => {
  return (
    <div css={cssBase}>
      <div className="topRow">
        <button>load</button>
        <button>save</button>
      </div>
      <div className="mainRow">
        <UiLayouterCore.Component />
      </div>
    </div>
  );
};
