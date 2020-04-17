import { css } from 'goober';
import { hx } from '~views/basis/qx';

export const SimulatorInputBar = () => {
  const cssSimulatorInputBar = css`
    flex-shrink: 0;
    border: solid 1px #08f;
    height: 40px;
  `;
  return <div css={cssSimulatorInputBar}>simulator input bar</div>;
};
