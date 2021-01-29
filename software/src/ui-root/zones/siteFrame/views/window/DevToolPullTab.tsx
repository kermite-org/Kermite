import { css } from 'goober';
import { h } from 'qx';
import { models } from '~/ui-root/zones/common/commonModels';

const cssDevToolPullTabBase = css`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  pointer-events: none;

  > div {
    transform: translate(30px, 0) rotate(-90deg);
    background: #579;
    color: #fff;
    padding: 1px 12px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    user-select: none;
    pointer-events: auto;
  }
`;

export const DevToolPullTab = () => {
  return (
    <div css={cssDevToolPullTabBase}>
      <div onClick={models.siteModel.toggleDevToolVisible}>devtools</div>
    </div>
  );
};
