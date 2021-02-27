import { h } from 'qx';
import { css } from 'qx/cssinjs';

export const WindowRestartButton = (props: { handler: () => void }) => {
  const cssReloadButton = css`
    padding: 3px 6px;
    margin-right: 10px;
    cursor: pointer;
  `;
  return (
    <button css={cssReloadButton} onClick={props.handler}>
      Restart
    </button>
  );
};
