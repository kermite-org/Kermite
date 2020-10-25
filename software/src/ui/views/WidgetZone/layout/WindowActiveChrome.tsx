import { css } from 'goober';
import { h } from '~lib/qx';

export const WindowActiveChrome = () => {
  const cssBase = css`
    position: absolute;
    pointer-events: none;
    width: 100%;
    height: 100%;
    /* border: solid 1px rgba(0, 128, 255, 0.3); */
    /* background: rgba(0, 160, 255, 0.15); */

    > div {
      position: absolute;
      width: 5px;
      height: 5px;
      background: #08f;
      border-radius: 50%;
      margin: 2px;
    }

    .tl {
      top: 0;
      left: 0;
    }

    .tr {
      top: 0;
      right: 0;
    }

    .bl {
      bottom: 0;
      left: 0;
    }

    .br {
      bottom: 0;
      right: 0;
    }
  `;
  return (
    <div css={cssBase}>
      <div class="tl" />
      <div class="tr" />
      <div class="bl" />
      <div class="br" />
    </div>
  );
};
