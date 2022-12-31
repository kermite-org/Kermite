import { jsx, css, FC } from 'alumina';

export const WidgetWindowActiveChrome: FC = () => (
  <div class={style}>
    <div class="tl" />
    <div class="tr" />
    <div class="bl" />
    <div class="br" />
  </div>
);

const style = css`
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
