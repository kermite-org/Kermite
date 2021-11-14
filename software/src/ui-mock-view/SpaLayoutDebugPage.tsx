/* eslint-disable @typescript-eslint/no-unused-vars */
import { css, FC, jsx } from 'alumina';

const cssLongContent = css`
  width: 200px;
  height: 400px;
  background: #cef;
`;

export const SpaLayoutDebugPage: FC = () => {
  const style = css`
    border: solid 4px #0c0;
    height: 100%;

    display: flex;
    flex-direction: column;

    > * {
      border: solid 3px #f80;
    }

    > .top-row {
      height: 40px;
    }

    > .main-row {
      flex-grow: 1;
    }

    > .bottom-row {
      height: 40px;
    }
  `;
  return (
    <div css={style}>
      <div class="top-row" />
      <div class="main-row">
        {/* <PageContent1 /> */}
        <PageContent2 />
      </div>
      <div class="bottom-row" />
    </div>
  );
};

const PageContent1: FC = () => {
  const style = css`
    border: solid 4px #00f;
    height: 100%;

    display: flex;
    flex-direction: column;

    > * {
      border: solid 3px #f08;
    }

    > .top-row {
      height: 40px;
    }

    > .main-row {
      height: 0;
      flex-grow: 1;
      overflow-y: scroll;
    }

    > .bottom-row {
      height: 40px;
    }
  `;
  return (
    <div css={style}>
      <div class="top-row" />
      <div class="main-row">
        <div css={cssLongContent}>aaa</div>
      </div>
      <div class="bottom-row" />
    </div>
  );
};

const PageContent2: FC = () => {
  const style = css`
    border: solid 4px #00f;
    height: 100%;

    display: flex;
    flex-direction: column;

    > * {
      border: solid 3px #c0f;
    }

    > .top-row {
      height: 40px;
    }

    > .main-row {
      height: 0;
      flex-grow: 1;
      display: flex;

      > * {
        height: 100%;
        border: solid 3px #08f;
      }
      > .side-column {
        width: 300px;
        overflow-y: scroll;
      }

      > .main-column {
        flex-grow: 1;
      }
    }

    > .bottom-row {
      height: 40px;
    }
  `;
  return (
    <div css={style}>
      <div class="top-row" />
      <div class="main-row">
        <div class="side-column">
          <div css={cssLongContent}>aaa</div>
        </div>
        <div class="main-column" />
      </div>
      <div class="bottom-row" />
    </div>
  );
};
