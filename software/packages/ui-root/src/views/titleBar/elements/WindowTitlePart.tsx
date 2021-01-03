import { css } from 'goober';
import { h } from 'qx';

export const WindowTitlePart = () => {
  const cssTitlePart = css`
    display: flex;
    margin-left: 8px;

    > .icon {
    }
    > .text {
      margin-left: 4px;
      color: #fff;
      font-size: 14px;
    }
  `;
  return (
    <div css={cssTitlePart}>
      <img className="icon" src="appicon.png" />
      <div className="text">Kermite</div>
    </div>
  );
};
